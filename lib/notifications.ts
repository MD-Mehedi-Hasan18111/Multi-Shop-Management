import nodemailer from "nodemailer";
import twilio from "twilio";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendStatusUpdateEmail(email: string, orderNumber: string, status: string) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Order Update: ${orderNumber}`,
      html: `<p>Your order <strong>${orderNumber}</strong> status has been updated to: <strong>${status}</strong>.</p>`,
    });
  } catch (error) {
    console.error("Email error:", error);
  }
}

export async function sendSMS(to: string, message: string) {
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
  } catch (error) {
    console.error("SMS error:", error);
  }
}

export async function sendLowStockAlertEmail(shopkeeperEmail: string, productName: string, stock: number) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: shopkeeperEmail,
      subject: `Low Stock Alert: ${productName}`,
      html: `<p>Attention!</p><p>Your product <strong>${productName}</strong> is running low on stock. Current stock level: <strong>${stock}</strong>.</p><p>Please restock soon.</p>`,
    });
  } catch (error) {
    console.error("Email error:", error);
  }
}
