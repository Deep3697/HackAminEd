# Telos Intelligence Hub (HackAminEd ERP Project)

**Team:** Code Killers  
**Event:** NU Hackathon - HackAminEd  

Telos Intelligence Hub is a modern, enterprise-ready Enterprise Resource Planning (ERP) platform designed for heavy-duty manufacturing and industrial supply chains. Built to streamline raw material procurement, factory floor production, inventory movement, and human resources, the platform uses intelligent Role-Based Access Control and AI features.

---

## ⚡ Core Features & Functionalities

### 1. Robust Role-Based Access Control (RBAC)
The application strictly enforces security through multi-layered role routing tailored to specific enterprise functions.
*   **Administrator**: Unrestricted global oversight. Monitors overall business P&L, global trade ratios, active users, and overrides payment approvals.
*   **Company Employees**: Dashboard dynamically adapts based on the user's Department (e.g., *Production & Quality*, *Transport & Logistics*, *Sales & Purchase*, *HR & Payroll*).
*   **Contractors / Vendors**: Specialized vendor portals to view their exact Purchase Contracts, active Material Dispatches, and track Invoice Payments natively.
*   **External Users / Customers**: Dedicated interface to observe their Sales Invoices, check Product Billing, and initiate chat inquiries.

### 2. Live Operational Hubs
*   **Command Center**: Executive dashboard displaying dynamic revenue statistics, daily active headcount, production deficit alerts, and a 3D Earth module for global fleet context.
*   **Sales & Purchase (Commercial Hub)**: Handles client inquiries, vendor purchase indents, pipeline tracking, and GST Compliance checks.
*   **Production & Quality Hub**: Live manufacturing floor work orders with progress bars, combined with the QC Inspection Queue. Built-in **Reverse Explosion Calculator** to calculate raw material deficits based on BOMs (Bill of Materials).
*   **Supply Chain & Logistics Hub**: Tracks real-time warehouse occupancy, Total Inventory Value, and live inbound/outbound movement feeds. Includes tools for stock adjustment and printing barcodes.
*   **Financial Integrity Hub**: The central General Ledger (GL) tracking credits/debits, creating manual journal entries, and a module for compliance monitoring.
*   **HR & Staffing Hub**: Tracks organizational headcount, department ratios, and payroll expenses.
*   **Maintenance & Asset Hub**: Real-time registry of factory machines (e.g., CNC Milling, Forging Presses) to monitor active versus downed equipment, along with predictive maintenance alerts.

### 3. Integrated AI Assistant (Built with Google Gemini API)
*   **Context-Aware Chatbot**: The system features a persistent AI chatbot available in the lower right corner.
*   **Database-backed intelligence**: Before calling the remote model we run simple natural‑language detectors (`phone number of`, `email of`, `number of roles`, `number of persons`, etc.) and answer directly from the Neon database. In addition, every request sends the relevant rows (items, person info limited by role, sales, roles) to the model prompt so it is effectively ‘trained’ on the current dataset.
*   **Data Security Filters**: The AI intercepts the user's role and scopes its database queries before responding. For example, an Employee can ask the AI about inventory or coworker emails, but the AI will refuse to provide private phone numbers that are restricted to Admins.
*   **Anti-Spam & offline fallback**: If your Gemini/OpenAI key is missing, invalid, or rate‑limited the bot gracefully handles the error and may still answer simple lookup questions directly from the database. When the key is wrong you’ll receive a clear message telling you to update `.env` instead of a generic system error.

### 4. Automated Background CRON Jobs
*   **Node-Cron Reminder Service**: The backend server runs scheduled jobs daily to sweep the database for unpaid client invoices.
*   **Communication Logging**: It calculates `due_date = invoice_date + credit_period_days` and generates customized WhatsApp/Email reminders (Upcoming, Due Today, Overdue) which are then saved to a `communication_logs` table automatically.

---

## 🛠️ Technology Stack

*   **Frontend**: 
    *   React.js with Vite
    *   React Router DOM (for secure path protection)
    *   Lucide-React (Dynamic Icons)
    *   Recharts (Data Visualization)
*   **Backend**: 
    *   Node.js & Express.js (v5 compatible)
    *   JSON Web Tokens (JWT) for Authentication Middlewares
    *   `node-cron` for automated scheduling
*   **Database**: 
    *   PostgreSQL hosted on Neon Cloud (`pg` library)
*   **AI Integration**: 
    *   `@google/generative-ai` (Gemini 2.5 Flash) **or** the OpenAI package (configurable via `OPENAI_API_KEY` in `.env`).

---

## 🚀 Setup & Installation

### Prerequisites
*   Node.js (v18+ recommended)
*   PostgreSQL Database instance

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and configure the environment:
   ```env
   PORT=5001
   DATABASE_URL=postgresql://your_user:your_password@your_host/your_dbname?sslmode=require
   JWT_SECRET=your_super_secret_jwt_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
4. Start the Express server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5001/api
   # Optional: if you renamed the chatbot endpoint on the server
   # you can specify it here (e.g. "/ai/chat" or "/ai/message").
   # Defaults to "/ai/command" if not set.
   VITE_AI_ENDPOINT=/ai/command
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## 🔒 Security Posture
The frontend guards routes inside `PrivateRoute.jsx`, forcibly redirecting users if they attempt to load a component out of their department scope. 
Simultaneously, the backend utilizes `verifyToken` and `roleCheck` middleware to intercept all API calls, preventing unauthorized Postman requests from bypassing the React UI. 
