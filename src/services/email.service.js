require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend-ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegisterEmail(userEmail , userName){
    const subject = "Welcome to our banking app!";
    const text = `Hi ${userName},\n\nThank you for registering with our banking app. We're excited to have you on board! If you have any questions or need assistance, feel free to reach out to our support team.\n\nBest regards,\nThe Banking App Team`;
    const html = `<p>Hi ${userName},</p><p>Thank you for registering with our banking app. We're excited to have you on board! If you have any questions or need assistance, feel free to reach out to our support team.</p><p>Best regards,<br>The Banking App Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail , userName , amount , toAccount){
     const subject = "Transaction Successful!";

    const text = `Hi ${userName},

Your transaction of $${amount} to account ${toAccount} was successful.

Best regards,
The Banking App Team`;

    const html = `
    <table width="100%" cellpadding="0" cellspacing="0" 
      style="background-image: url('https://images.unsplash.com/photo-1556745757-8d76bdb6984b');
             background-size: cover;
             background-position: center;
             padding: 40px 0;">
      
      <tr>
        <td align="center">
          <table width="600" cellpadding="20" cellspacing="0"
            style="background: rgba(255,255,255,0.9);
                   border-radius: 10px;
                   font-family: Arial, sans-serif;
                   text-align: center;">
            
            <tr>
              <td>
                <h2 style="color: #2c3e50;">Transaction Successful 🎉</h2>
                
                <p style="font-size: 16px; color: #333;">
                  Hi <strong>${userName}</strong>,
                </p>

                <p style="font-size: 16px; color: #333;">
                  Your transaction of 
                  <strong>$${amount}</strong> 
                  to account 
                  <strong>${toAccount}</strong> 
                  was successful.
                </p>

                <p style="font-size: 14px; color: #555;">
                  If this wasn’t you, please contact support immediately.
                </p>

                <hr style="margin: 20px 0;">

                <p style="font-size: 12px; color: #777;">
                  © 2026 Banking App Team
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
    `;

    await sendEmail(userEmail, subject, text, html);
}
async function sendEmailNotification(userEmail, userName, amount, toAccount) {
    const subject = "Transaction Successful!";
    const text = `Hi ${userName},\n\nYour transaction of $${amount} to account ${toAccount} was successful. If you have any questions or need assistance, feel free to reach out to our support team.\n\nBest regards,\nThe Banking App Team`;
    const html = `<p>Hi ${userName},</p><p>Your transaction of $${amount} to account ${toAccount} was successful. If you have any questions or need assistance, feel free to reach out to our support team.</p><p>Best regards,<br>The Banking App Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}
module.exports = { sendRegisterEmail, sendTransactionEmail, sendEmailNotification } ;