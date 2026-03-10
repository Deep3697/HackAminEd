# 🏭 Telos Intelligence Hub – ERP Platform

> **An Enterprise Resource Planning solution engineered for modern manufacturing**


**Telos Intelligence Hub** is a modern, enterprise-ready Enterprise Resource Planning (ERP) platform designed for heavy-duty manufacturing and industrial supply chains. It streamlines raw material procurement, factory floor production, inventory management, financial operations, and human resources through intelligent role-based access control and AI-powered insights.

---

## ✨ Key Highlights

- 🔐 **Multi-tier Role-Based Access Control** – Secure, granular authorization for Admins, Employees, Contractors, and Customers
- 🎯 **7 Specialized Operational Hubs** – Command Center, Commercial, Production, Finance, Supply Chain, HR, and Maintenance
- 🤖 **AI-Powered Assistant** – Context-aware chatbot with Google Gemini integration and database-backed intelligence
- ⚡ **Real-time Dashboards** – Live analytics, production tracking, and financial overview
- 🔄 **Automated Workflows** – Scheduled CRON jobs for invoice reminders and business processes
- 📊 **Production Intelligence** – Bill of Materials (BOM) management with reverse explosion calculator
- 🔒 **Enterprise Security** – JWT authentication, encrypted passwords, role-based API access

---


## ⚡ Core Features & Functionalities

### 1. **Robust Role-Based Access Control (RBAC)**
Strict security enforcement with granular, role-specific access:

- **👨‍💼 Administrator** 
  - Unrestricted global oversight
  - Monitor overall business P&L, trade ratios, and active users
  - Override payment approvals
  - User management and permission configuration

- **👨‍🔧 Company Employees**
  - Department-specific dashboards (Production, HR, Finance, Logistics, Sales)
  - View only data relevant to their department
  - Collaborative tools for team coordination

- **🤝 Contractors & Vendors**
  - Specialized vendor portal
  - View Purchase Contracts and Material Dispatches
  - Track Invoice Payments and supplier performance

- **👥 External Users & Customers**
  - Customer-facing portal
  - View Sales Invoices and Product Billing
  - Initiate chat inquiries with support

### 2. **Seven Specialized Operational Hubs**

| Hub | Key Features |
|-----|--------------|
| **Command Center** | Executive dashboard with revenue stats, daily headcount, production alerts, 3D fleet visualization |
| **Commercial Hub** | Client inquiries, vendor indents, pipeline tracking, GST compliance checks |
| **Production & QC Hub** | Work order management, progress tracking, QC inspection queue, **BOM reverse explosion calculator** |
| **Supply Chain Hub** | Real-time warehouse occupancy, inventory valuation, inbound/outbound movement, barcode printing |
| **Financial Hub** | General Ledger (GL) tracking, journal entries, compliance monitoring, financial reporting |
| **HR Hub** | Headcount tracking, department ratios, payroll management, employee records |
| **Maintenance Hub** | Equipment registry, machinery status, predictive maintenance alerts, downtime tracking |

### 3. **Integrated AI Assistant (Google Gemini)**

- **Context-Aware Chatbot** – Persistent AI assistant in the lower right corner
- **Smart Query Detection** – Recognizes patterns like "phone number of", "email of", "number of roles" and answers directly from the database
- **Database-Backed Intelligence** – Sends relevant dataset rows to the AI model for contextual understanding
- **Role-Based Data Security** – AI filters queries by user role (e.g., employees can't access restricted admin data)
- **Graceful Error Handling** – Works offline with simple queries; provides clear feedback if API keys are misconfigured
- **Multi-Model Support** – Supports Google Gemini and Groq SDK with configurable switching

### 4. **Automated Background CRON Jobs**

- **Invoice Reminder Service** – Daily jobs identify unpaid invoices and trigger notifications
- **Smart Due Date Calculation** – `due_date = invoice_date + credit_period_days`
- **Multi-Channel Notifications** – Generates WhatsApp/Email reminders (Upcoming, Due Today, Overdue)
- **Communication Logging** – Saves all automated reminders to `communication_logs` table for audit trails
- **Extensible Job Queue** – Framework for adding additional scheduled tasks

---

## 🛠️ Technology Stack

### **Frontend**
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2.0 | Modern UI framework with hooks |
| Vite | 5.x | Lightning-fast build tool & dev server |
| React Router DOM | 7.1.0 | Client-side routing with protected routes |
| TailwindCSS | 4.2.1 | Utility-first CSS framework |
| Framer Motion | 11.18.0 | Smooth animations & transitions |
| Lucide React | 0.468.0 | Beautiful, customizable icons |
| Recharts | Latest | Data visualization & charts |
| Axios | 1.13.6 | Promise-based HTTP client |

### **Backend**
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| Express.js | 5.2.1 | Web application framework |
| PostgreSQL | 12+ | Relational database |
| JWT | 9.0.3 | Stateless authentication |
| Bcrypt | 6.0.0 | Secure password hashing |
| node-cron | 4.2.1 | Task scheduling |
| Google Generative AI | 0.24.1 | Gemini API integration |
| Groq SDK | 0.37.0 | Alternative LLM provider |
| CORS | 2.8.6 | Cross-origin resource sharing |
| dotenv | 16.6.1 | Environment variable management |
| pg | 8.20.0 | PostgreSQL client |

### **DevOps & Tools**
- ESLint – Code quality & style enforcement
- Hot Module Replacement (HMR) – Rapid development feedback
- npm – Package management

---

## 🚀 Getting Started

### **Prerequisites**

Before you begin, ensure you have:
- **Node.js** >= 18.x
- **npm** >= 9.x  
- **PostgreSQL** >= 12.x (local or cloud-hosted)
- **Git** for version control
- **API Keys** (optional, for AI features):
  - Google Gemini API key (for AI assistant)
  - Groq API key (alternative/backup AI)

### **Step 1: Clone & Navigate**

```bash
git clone https://github.com/yourusername/HackAminEd.git
cd HackAminEd
```

### **Step 2: Backend Configuration**

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=hackamined_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_recommended

# Server Configuration
PORT=5000
NODE_ENV=development

# AI Configuration (Optional)
GOOGLE_API_KEY=your_google_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Optional: Specify which AI provider to use
# AI_PROVIDER=gemini  # or 'groq'
```

### **Step 3: Frontend Configuration**

```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# AI Endpoint (if custom)
VITE_AI_ENDPOINT=/ai/command
```

### **Step 4: Database Setup**

Initialize your PostgreSQL database:

```bash
# Optional: Create database
createdb hackamined_db

# From server directory, seed demo data
cd server
npm run seed-demo
```

Troubleshooting database setup:
```bash
# Check current database state
npm run test-db

# Clean up if needed
npm run cleanup-person-columns

# Reset admin password if needed
npm run fix-admin-password
```

### **Step 5: Run the Application**

**Terminal 1 – Start Backend:**
```bash
cd server
npm run dev
```
✅ Backend ready at `http://localhost:5000`

**Terminal 2 – Start Frontend:**
```bash
cd client
npm run dev
```
✅ Frontend ready at `http://localhost:5173`

**Access the Application:**
- Open your browser to `http://localhost:5173`
- Login with demo credentials (see seed data)
- Explore the different operational hubs based on your role

---

## 📚 API Documentation

### **Base URL**
```
http://localhost:5000/api
```

### **Authentication**
All protected endpoints require a JWT token:
```
Authorization: Bearer <your_jwt_token>
```

### **API Routes Structure**

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/api/auth` | Login, Register, Token Refresh | No / Yes |
| `/api/admin` | User Management, System Config | Yes (Admin) |
| `/api/commercial` | Sales Orders, Purchases, Clients | Yes (Commercial) |
| `/api/production` | Work Orders, QC, BOMs | Yes (Production) |
| `/api/finance` | GL Entries, Invoices, Reports | Yes (Finance) |
| `/api/supply-chain` | Inventory, Warehouse, Logistics | Yes (Supply Chain) |
| `/api/hr` | Employees, Payroll, Departments | Yes (HR) |
| `/api/maintenance` | Equipment, Maintenance Tasks | Yes (Maintenance) |
| `/api/simulation` | Scenario Modeling, What-if Analysis | Yes (Admin/Production) |
| `/api/ai` | AI Assistant Endpoints | Yes (Any) |

### **Example API Calls**

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hackamined.com","password":"admin123"}'
```

**Fetch User Dashboard:**
```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query AI Assistant:**
```bash
curl -X POST http://localhost:5000/api/ai/command \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query":"What is the total inventory value?"}'
```

---

## 🔐 Security Architecture

### **Frontend Security**
- **Protected Routes** – `PrivateRoute.jsx` guards unauthorized navigation
- **Role-Based Navigation** – UI only shows menu items users have permission to access
- **Token Storage** – JWT stored securely in context/local storage
- **Automatic Redirect** – Unauthenticated users redirected to login

### **Backend Security**
- **JWT Verification** – `verifyToken` middleware validates all incoming tokens
- **Role-Based Authorization** – `roleCheck` middleware enforces permissions on each endpoint
- **Password Security** – Bcrypt with salt hashing (~12 rounds)
- **SQL Injection Prevention** – Parameterized queries via `pg` library
- **CORS Protection** – Controlled cross-origin requests
- **Rate Limiting** – Can be added for API endpoints (recommended for production)

### **Database Security**
- **Role-Scoped Data Access** – Users can only query data they're authorized to see
- **Encrypted Sensitive Fields** – Passwords and sensitive data encrypted in transit and at rest
- **Audit Logging** – Communication logs track all automated actions
- **Data Validation** – Input sanitization on all API endpoints

### **AI Security**
- **Role-Aware Responses** – AI filters database queries by user role
- **API Key Rotation** – Supports switching between AI providers
- **Error Handling** – Safe graceful degradation if API keys are missing

---

## 📊 Data Models

### **Core Models**

**User**
```
- id (UUID)
- email (unique)
- password_hash (bcrypt)
- role (admin | employee | contractor | customer)
- department (optional)
- is_active
- created_at, updated_at
```

**Bill of Materials (BOM)**
```
- id
- product_id
- component_structure (JSON)
- raw_materials (array)
- unit_cost
- created_at, updated_at
```

**Work Order**
```
- id
- product_id
- quantity
- status (pending | in_progress | completed)
- progress_percentage
- assigned_to
- due_date
```

**Invoice**
```
- id
- invoice_number (unique)
- customer_id or vendor_id
- amount
- due_date
- status (draft | sent | paid | overdue)
- payment_date (nullable)
```

**General Ledger Entry**
```
- id
- account_id
- debit_amount
- credit_amount
- transaction_date
- reference (invoice/order/etc)
```

---

## 🧪 Development & Testing

### **Available npm Scripts**

**Backend:**
```bash
npm run dev                      # Start with file watching
npm run start                    # Production start
npm run seed-demo               # Load demo/test data
npm run fix-admin-password      # Reset admin credentials
npm run cleanup-person-columns  # Database maintenance
npm run test-db                 # Test database connection
npm run test-api                # Test API endpoints
```

**Frontend:**
```bash
npm run dev      # Start dev server with HMR (hot reload)
npm run build    # Production optimized build
npm run lint     # Run ESLint code quality checks
npm run preview  # Preview production build locally
```

### **Running Tests**

```bash
# Backend API tests
cd server
npm run test-api

# Frontend linting
cd ../client
npm run lint
```

---

## 🏗️ Building for Production

### **Frontend Build**
```bash
cd client
npm run build
```
Output: `client/dist/` – Ready for deployment to any static host (Vercel, Netlify, AWS S3, etc.)

### **Backend Deployment**
```bash
cd server
# Ensure .env has production database URL
NODE_ENV=production npm run start
```

Deploy to:
- Heroku (with Procfile)
- Railway
- Google Cloud Run
- AWS EC2 / Elastic Beanstalk
- DigitalOcean

### **Environment Variables (Production)**
Before deploying, update `.env`:
- Use production database URL (cloud-hosted PostgreSQL)
- Strong JWT_SECRET (min 32 chars, cryptographically random)
- Verify API keys are correct
- Set `NODE_ENV=production`
- Configure CORS_ORIGIN for your frontend domain

---

## 🤝 Contributing

We welcome contributions! Follow these steps:

### **Workflow**
1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Write clean, readable code
   - Follow the existing code style
   - Add comments for complex logic
   - Test your changes locally

3. **Commit with meaningful messages:**
   ```bash
   git commit -m "feat: Add invoice reminder notifications"
   ```

4. **Push and create a Pull Request:**
   ```bash
   git push origin feature/your-feature-name
   ```

### **Code Standards**
- **Frontend:** Follow ESLint rules, use functional components with hooks
- **Backend:** Consistent error handling, use middleware pattern, document complex endpoints
- **Naming:** camelCase for variables/functions, PascalCase for components/classes
- **Comments:** Add docstrings for public functions and complex logic
- **Testing:** Test new features before submitting PR

### **Areas for Contribution**
- 🐛 Bug fixes
- ✨ New features for operational hubs
- 📱 Mobile app (React Native)
- 🧪 Test coverage improvements
- 📚 Documentation enhancements
- 🌍 Internationalization (i18n)

---

## 📁 Deployment Checklist

Before going to production, ensure:

- [ ] Database backed up and tested
- [ ] All environment variables configured correctly
- [ ] JWT_SECRET is strong and random (32+ chars)
- [ ] API keys (Gemini, Groq) are valid
- [ ] CORS origin configured for your domain
- [ ] Frontend build runs without errors
- [ ] All security middlewares enabled
- [ ] Database SSL connection enabled (production)
- [ ] Rate limiting configured
- [ ] Error logging/monitoring set up
- [ ] Database indexes created for common queries
- [ ] Automated daily backups configured

---

## 🗺️ Roadmap & Future Enhancements

### **Q2 2026**
- [ ] Mobile app (React Native) for field operations
- [ ] Advanced predictive analytics with ML models
- [ ] Real-time notifications (WebSocket)
- [ ] Bulk import/export (Excel, CSV)

### **Q3 2026**
- [ ] Multi-language support (i18n)
- [ ] Offline mode with automatic sync
- [ ] Enhanced audit logging with blockchain
- [ ] IoT integration for equipment monitoring
- [ ] Advanced role customization

### **Q4 2026**
- [ ] Supply chain transparency (blockchain)
- [ ] Machine learning-based demand forecasting
- [ ] Advanced reporting & BI integration
- [ ] API versioning and public API docs

---

## 📄 Documentation & Resources

- [Frontend README](./client/README.md) – Client-specific setup and development
- [Backend Routes](./server/src/routes/) – API endpoint documentation
- [Database Schema](./server/src/lib/initDb.js) – SQL schema definitions
- [Controllers](./server/src/controllers/) – Business logic and request handlers
- [Models](./server/src/models/) – Data structure definitions

---

## 📞 Support & Contact

### **For Bugs & Issues**
- Open an issue on GitHub with detailed reproduction steps
- Include error messages, screenshots, and environment info

### **For Questions**
- Check existing documentation and GitHub issues first
- Contact the development team via email or chat

### **Security Issues**
Report security vulnerabilities responsibly to the maintainers (DO NOT open public issues)

---

## 📝 License & Attribution

**License:** ISC License

This project is part of the **NU Hackathon - HackAminEd** competition.

**Team:** Code Killers

---

## 🎉 Quick Start Recap

```bash
# 1. Clone repository
git clone https://github.com/yourusername/HackAminEd.git && cd HackAminEd

# 2. Setup backend
cd server && npm install && cp .env.example .env
# Edit .env with your database credentials
npm run seed-demo
npm run dev

# 3. In new terminal, setup frontend
cd client && npm install && cp .env.example .env
npm run dev

# 4. Open browser
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

---

**Made with ❤️ by Code Killers**

*Last Updated: March 2026*
