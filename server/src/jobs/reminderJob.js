const cron = require('node-cron');
const pool = require('../lib/db');

// RULES:
// 7 days before due date -> Payment upcoming reminder
// 3 days before due date -> Payment upcoming reminder
// On due date -> Payment due today reminder
// After due date -> Overdue reminder every day (only if unpaid)


const RUN_EVERY_MINUTE_FOR_TESTING = process.env.TEST_CRON === 'true';
const scheduleTime = RUN_EVERY_MINUTE_FOR_TESTING ? '* * * * *' : '0 17 * * *'; // 5:00 PM daily

const initReminderJob = () => {
  console.log(`⏰ Starting invoice reminder cron job (Schedule: ${scheduleTime})`);
  
  cron.schedule(scheduleTime, async () => {
    console.log('🔄 Running automated invoice reminders job...');
    try {
      // 1. Fetch unpaid invoices mapped to customers
      const result = await pool.query(`
        SELECT 
          i.id as invoice_id, 
          i.invoice_number, 
          i.amount, 
          i.due_date, 
          i.status as invoice_status,
          c.id as customer_id, 
          c.name as customer_name, 
          c.email, 
          c.phone
        FROM invoices i
        JOIN customers c ON i.customer_id = c.id
        WHERE i.status = 'unpaid'
      `);

      const unpaidInvoices = result.rows;
      if (unpaidInvoices.length === 0) {
        console.log('✅ No unpaid invoices found. Reminder job complete.');
        return;
      }

      console.log(`📊 Found ${unpaidInvoices.length} unpaid invoices. Processing triggers...`);

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today to midnight for precise day matching

      for (const invoice of unpaidInvoices) {
        const dueDate = new Date(invoice.due_date);
        dueDate.setHours(0, 0, 0, 0);

        // Calculate diff in days
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // >0 = future, 0 = today, <0 = past

        let triggered = false;
        let messageType = '';
        let messageText = '';

        if (diffDays === 7) {
          triggered = true;
          messageType = 'upcoming';
          messageText = `Hi ${invoice.customer_name}, just a friendly reminder that Invoice ${invoice.invoice_number} for ₹${invoice.amount} is due in 7 days on ${dueDate.toLocaleDateString()}.`;
        } else if (diffDays === 3) {
          triggered = true;
          messageType = 'upcoming';
          messageText = `Hi ${invoice.customer_name}, Reminder: Invoice ${invoice.invoice_number} for ₹${invoice.amount} is due in 3 days.`;
        } else if (diffDays === 0) {
          triggered = true;
          messageType = 'due';
          messageText = `Hi ${invoice.customer_name}, Invoice ${invoice.invoice_number} for ₹${invoice.amount} is due TODAY. Please arrange payment to avoid late fees.`;
        } else if (diffDays < 0) {
          // Overdue Reminder EVERY DAY
          triggered = true;
          messageType = 'overdue';
          messageText = `URGENT: ${invoice.customer_name}, Invoice ${invoice.invoice_number} for ₹${invoice.amount} is OVERDUE by ${Math.abs(diffDays)} days. Please pay immediately.`;
        }

        if (triggered) {
          // Log Communication for EMAIL
          if (invoice.email) {
            await logCommunication(invoice.invoice_id, invoice.customer_id, 'email', messageType, messageText);
          }
          // Log Communication for WHATSAPP
          if (invoice.phone) {
            await logCommunication(invoice.invoice_id, invoice.customer_id, 'whatsapp', messageType, messageText);
          }
        }
      }

      console.log('✅ Reminder job completed successfully.');

    } catch (err) {
      console.error('❌ Error in reminder cron job:', err.message);
    }
  });
};

const logCommunication = async (invoiceId, customerId, channel, type, message) => {
  try {
    // In a real app, actually send the email/whatsapp using Twilio/SendGrid here!
    // For now, we simulate success and log to the database.
    console.log(`[SENDING ${channel.toUpperCase()}] To Customer ${customerId}: ${message}`);

    await pool.query(
      `INSERT INTO communication_logs (invoice_id, customer_id, channel, message_type, message, status) VALUES ($1, $2, $3, $4, $5, $6)`,
      [invoiceId, customerId, channel, type, message, 'success']
    );
  } catch (err) {
    console.error(`Failed to log ${channel} communication for invoice ${invoiceId}:`, err.message);
  }
};

module.exports = { initReminderJob };
