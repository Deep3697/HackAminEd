const pool = require('../lib/db');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const processCommand = async (req, res) => {
  const { message, userRole } = req.body;
  const safeRole = (userRole || 'user').toLowerCase();

  console.log("🤖 === NEW AI REQUEST ===");
  console.log("🗣️ User Message:", message);
  console.log("🛡️ Role Detected by Backend:", safeRole);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
      // ADMIN: Gets full access to items, sales, and ALL person info
      dbData.items = await safeQuery("SELECT * FROM items LIMIT 50");
      dbData.sales = await safeQuery("SELECT * FROM sales_order LIMIT 20");
      dbData.person = await safeQuery('SELECT "fullName", "contactNo", "whatsappNumber", email, address, role FROM person LIMIT 50');
      roleContext = "You are speaking to an ADMIN. You have full access to items, sales, and personal data (phones, addresses).";
      console.log("🔓 Action: ADMIN access granted.");

    } else if (safeRole === 'employee') {
      // EMPLOYEE: Gets items, but RESTRICTED person info (No phones or addresses!)
      dbData.items = await safeQuery("SELECT * FROM items LIMIT 50");
      dbData.person = await safeQuery('SELECT "fullName", email, role FROM person LIMIT 50');
      roleContext = "You are speaking to an EMPLOYEE. You can share item data, but you ONLY have names and emails for people. No phone numbers.";
      console.log("🔒 Action: EMPLOYEE access granted. Sensitive data stripped.");

    } else if (safeRole === 'contractor') {
      // CONTRACTOR: ONLY gets items. NO person data whatsoever.
      dbData.items = await safeQuery("SELECT * FROM items LIMIT 50");
      roleContext = "You are speaking to a CONTRACTOR. You can ONLY share items/inventory. Refuse any questions about people or sales.";
      console.log("🔒 Action: CONTRACTOR access granted. Only items fetched.");

    } else {
      // USER: Gets absolutely nothing.
      roleContext = "You are speaking to a standard USER. You have NO database access. Refuse any requests for data, phone numbers, or inventory.";
      console.log("🛑 Action: USER access applied. ZERO database access granted.");
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
    console.error("❌ API Error:", err.message);
    
    // Check if the error is a Quota/Rate Limit error from Google
    if (err.message.includes("quota") || err.message.includes("429") || err.message.includes("QuotaFailure")) {
       return res.json({ reply: "I'm currently receiving too many requests. Please wait a moment and try asking again!" });
    }
    
    res.json({ reply: `System Error: Unable to process request at this time.` });
  }
};

module.exports = { processCommand };