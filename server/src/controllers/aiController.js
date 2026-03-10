const pool = require('../lib/db');
// 1. We swap GoogleGenerativeAI for Groq
const Groq = require("groq-sdk"); 
require('dotenv').config();

// 2. Initialize the Groq client
const groqApiKey = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: groqApiKey });

const processCommand = async (req, res) => {
  const { message, userRole } = req.body;
  const safeRole = (userRole || 'user').toLowerCase();

  console.log("🤖 === NEW GROQ AI REQUEST ===");
  console.log("🗣️ User Message:", message);
  console.log("🛡️ Role Detected by Backend:", safeRole);

  try {
    let dbData = {};
    let roleContext = "";

    // Safely query your actual tables from the screenshot
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
      dbData.items = await safeQuery("SELECT * FROM items LIMIT 50");
      dbData.sales = await safeQuery("SELECT * FROM sales_order LIMIT 20");
      dbData.person = await safeQuery('SELECT "fullName", "contactNo", "whatsappNumber", email, address, role FROM person LIMIT 50');
      roleContext = "You are speaking to an ADMIN. You have full access to items, sales, and personal data (phones, addresses).";
      console.log("🔓 Action: ADMIN access granted.");

    } else if (safeRole === 'employee') {
      dbData.items = await safeQuery("SELECT * FROM items LIMIT 50");
      dbData.person = await safeQuery('SELECT "fullName", email, role FROM person LIMIT 50');
      roleContext = "You are speaking to an EMPLOYEE. You can share item data, but you ONLY have names and emails for people. No phone numbers.";
      console.log("🔒 Action: EMPLOYEE access granted. Sensitive data stripped.");

    } else if (safeRole === 'contractor') {
      dbData.items = await safeQuery("SELECT * FROM items LIMIT 50");
      roleContext = "You are speaking to a CONTRACTOR. You can ONLY share items/inventory. Refuse any questions about people or sales.";
      console.log("🔒 Action: CONTRACTOR access granted. Only items fetched.");

    } else {
      roleContext = "You are speaking to a standard USER. You have NO database access. Refuse any requests for data, phone numbers, or inventory.";
      console.log("🛑 Action: USER access applied. ZERO database access granted.");
    }

    const systemPrompt = `
      You are the "Telos Intelligence Hub" AI Assistant, a highly secure enterprise AI.
      
      ROLE CONTEXT:
      ${roleContext}
      
      CURRENT DATABASE KNOWLEDGE:
      ${JSON.stringify(dbData)}
      
      STRICT SECURITY INSTRUCTIONS:
      1. Answer with EXTREME brevity. Answer EXACTLY what is asked and NOTHING MORE.
      2. If the user asks for a count, reply ONLY with the number. Do not list names.
      3. Map common words: If they ask for a "phone number", check the "contactNo" and "whatsappNumber" fields. 
      4. Be highly forgiving of uppercase/lowercase typos in names (e.g., "deep" = "Deep").
      5. If a person or item is NOT found in the JSON, say: "I cannot find that record in the database."
      6. If the person IS found, but the requested field (like phone number) is blank, say: "That user is in the database, but their phone number is currently blank."
      7. ONLY use the phrase "You do not have the required permissions" if the Role Context explicitly forbids you from sharing that data type.
      8. Do not explain your reasoning. Just provide the answer.
      
      User: "${message}"
    `;

    // 3. The new Groq Generation Call
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: systemPrompt }],
      model: "llama-3.1-8b-instant", // <-- THE NEW, LIGHTNING-FAST REPLACEMENT
      temperature: 0.2, 
    });

    const reply = chatCompletion.choices[0]?.message?.content || "No response generated.";
    return res.json({ reply: reply.trim() });

  } catch (err) {
    console.error("❌ Groq API Error:", err.message);
    res.json({ reply: `System Error: ${err.message}` });
  }
};

module.exports = { processCommand };