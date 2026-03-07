const pool = require('../lib/db');
require('dotenv').config();

// support both Google Gemini and OpenAI based on environment configuration
let genAI;
let aiAvailable = false; // will flip to true if we successfully create a client
const googleKey = process.env.GEMINI_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (googleKey) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(googleKey);
    aiAvailable = true;
  } catch (e) {
    console.error('Failed to initialize GoogleGenerativeAI:', e.message);
  }
} else if (openaiKey) {
  try {
    const { Configuration, OpenAIApi } = require('openai');
    const configuration = new Configuration({ apiKey: openaiKey });
    const openaiClient = new OpenAIApi(configuration);
    genAI = {
      // mimic getGenerativeModel interface used below
      getGenerativeModel: () => ({
        generateContent: async (prompt) => {
          const completion = await openaiClient.createChatCompletion({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 300,
          });
          return {
            response: {
              text: () => completion.data.choices[0].message.content,
            },
          };
        },
      }),
    };
    aiAvailable = true;
  } catch (e) {
    console.error('Failed to initialize OpenAI client:', e.message);
  }
} else {
  console.error('No AI API key configured (GEMINI_API_KEY or OPENAI_API_KEY).');
}

const processCommand = async (req, res) => {
  const { message, userRole } = req.body;
  const safeRole = (userRole || 'user').toLowerCase();

  console.log('🤖 === NEW AI REQUEST ===');
  console.log('🗣️ User Message:', message);
  console.log('🛡️ Role Detected by Backend:', safeRole);

  // very simple NLP fallback: if the user is clearly asking for a piece of info we can
  // fetch from the database, do that first so the chatbot responds even when the AI
  // service is unavailable or mis‑configured.
  const answerFromDatabase = async () => {
    const lower = message.toLowerCase();

    // phone number lookup
    const phoneMatch = lower.match(/phone\s*number\s*(?:of|for)\s*([\w\s\.\-]+)/i);
    if (phoneMatch) {
      const name = phoneMatch[1].trim();
      try {
        const { rows } = await pool.query(
          'SELECT "fullName", "contactNo" FROM person WHERE LOWER("fullName") LIKE $1 LIMIT 1',
          [`%${name.toLowerCase()}%`]
        );
        if (rows.length) {
          return `The phone number for ${rows[0].fullName} is ${rows[0].contactNo || 'not available'}.`;
        }
        return `I could not find a person named \"${name}\" in the database.`;
      } catch (e) {
        console.warn('DB lookup failed:', e.message);
      }
    }

    // email lookup
    const emailMatch = lower.match(/email\s*(?:of|for)\s*([\w\s\.\-]+)/i);
    if (emailMatch) {
      const name = emailMatch[1].trim();
      try {
        const { rows } = await pool.query(
          'SELECT "fullName", email FROM person WHERE LOWER("fullName") LIKE $1 LIMIT 1',
          [`%${name.toLowerCase()}%`]
        );
        if (rows.length) {
          return `The email for ${rows[0].fullName} is ${rows[0].email || 'not available'}.`;
        }
        return `I could not find a person named \"${name}\" in the database.`;
      } catch (e) {
        console.warn('DB lookup failed:', e.message);
      }
    }

    // count roles (admin only)
    if (lower.includes('number of roles') || lower.includes('how many roles')) {
      try {
        const { rows } = await pool.query('SELECT COUNT(*) AS count FROM roles');
        return `There are ${rows[0].count} roles defined.`;
      } catch (e) {
        console.warn('DB lookup failed:', e.message);
      }
    }

    // count persons
    if (/(number|no\.|count)\s+of\s+(persons?|people|users?)/.test(lower)) {
      try {
        const { rows } = await pool.query('SELECT COUNT(*) AS count FROM person');
        return `There are ${rows[0].count} people in the system.`;
      } catch (e) {
        console.warn('DB lookup failed:', e.message);
      }
    }

    return null;
  };

  const dbAnswer = await answerFromDatabase();
  if (dbAnswer) {
    console.log('✅ DB-only answer produced:', dbAnswer);
    return res.json({ reply: dbAnswer });
  }

  if (!aiAvailable) {
    console.error('AI client unavailable (missing/invalid key).');
    return res.json({
      reply:
        'AI service is not available. I can only answer a few direct database questions right now.',
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let dbData = {};
    let roleContext = '';

    // Safely query the database without crashing if a table is missing
    const safeQuery = async (queryText) => {
      try {
        const response = await pool.query(queryText);
        return response.rows;
      } catch (e) {
        console.warn(`⚠️ DB Warning: ${e.message} (Skipping)`);
        return [];
      }
    };

    // --- THE STRICT ROLE TRAFFIC COP ---
    if (safeRole === 'admin') {
      dbData.items = await safeQuery('SELECT * FROM items LIMIT 50');
      dbData.sales = await safeQuery('SELECT * FROM sales_order LIMIT 20');
      dbData.person = await safeQuery('SELECT "fullName", "contactNo", "whatsappNumber", email, address, role FROM person LIMIT 50');
      // extra helpful table for admin debugging
      dbData.roles = await safeQuery('SELECT * FROM roles LIMIT 50');
      roleContext =
        'You are speaking to an ADMIN. You have full access to items, sales, and personal data (phones, addresses).';
      console.log('🔓 Action: ADMIN access granted.');
    } else if (safeRole === 'employee') {
      dbData.items = await safeQuery('SELECT * FROM items LIMIT 50');
      dbData.person = await safeQuery('SELECT "fullName", email, role FROM person LIMIT 50');
      roleContext =
        'You are speaking to an EMPLOYEE. You can share item data, but you ONLY have names and emails for people. No phone numbers.';
      console.log('🔒 Action: EMPLOYEE access granted. Sensitive data stripped.');
    } else if (safeRole === 'contractor') {
      dbData.items = await safeQuery('SELECT * FROM items LIMIT 50');
      roleContext =
        'You are speaking to a CONTRACTOR. You can ONLY share items/inventory. Refuse any questions about people or sales.';
      console.log('🔒 Action: CONTRACTOR access granted. Only items fetched.');
    } else {
      roleContext =
        'You are speaking to a standard USER. You have NO database access. Refuse any requests for data, phone numbers, or inventory.';
      console.log('🛑 Action: USER access applied. ZERO database access granted.');
    }

    const systemPrompt = `
      You are the "Telos Intelligence Hub" AI Assistant.
      
      ROLE CONTEXT:
      ${roleContext}
      
      CURRENT DATABASE KNOWLEDGE:
      ${JSON.stringify(dbData)}
      
      INSTRUCTIONS:
      - Answer concisely using ONLY the provided JSON data above.
      - If they ask for data that is NOT in your JSON block (like a phone number, but you only have an email), explicitly state: "You do not have the required permissions to view that information."
      
      User: "${message}"
    `;

    const result = await model.generateContent(systemPrompt);
    return res.json({ reply: result.response.text().trim() });
  } catch (err) {
    console.error('❌ AI Error:', err);

    // if the key is known-bad, disable AI for future requests
    if (
      err.message?.toLowerCase().includes('leaked') ||
      err.message?.toLowerCase().includes('unauthorized') ||
      err.message?.toLowerCase().includes('invalid')
    ) {
      aiAvailable = false;
      console.warn('⚠️ Disabling AI client due to configuration error.');
      return res.json({
        reply:
          'AI key appears to be invalid or revoked. Please update your .env and restart the server.',
      });
    }

    if (
      err.message?.toLowerCase().includes('quota') ||
      err.message?.includes('429') ||
      err.message?.includes('QuotaFailure')
    ) {
      return res.json({
        reply:
          "I'm currently receiving too many requests. Please wait a moment and try asking again!",
      });
    }

    // pass a bit more info back for debugging during development
    const messageBack =
      process.env.NODE_ENV === 'development'
        ? `System Error: ${err.message}`
        : 'System Error: Unable to process request at this time.';
    return res.json({ reply: messageBack });
  }
};

module.exports = { processCommand };