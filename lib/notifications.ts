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

export async function sendSellerRequestEmail(
  adminEmail: string,
  customerName: string,
  customerEmail: string,
  shopName: string,
  niche: string,
  nidNumber: string,
  nidImage: string,
  productDetails: string
) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: adminEmail,
      subject: `New Seller Application: ${shopName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; rounded-corners: 12px;">
          <h2 style="color: #2563eb; font-weight: 800; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">New Seller Application</h2>
          <p>A customer has applied to become a Seller on your platform. Here are the details:</p>
          <table border="0" cellpadding="8" style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr style="background: #f4f4f5;">
              <td style="width: 180px; font-weight: bold; border: 1px solid #e4e4e7;">Customer Name</td>
              <td style="border: 1px solid #e4e4e7;">${customerName}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; border: 1px solid #e4e4e7;">Customer Email</td>
              <td style="border: 1px solid #e4e4e7;">${customerEmail}</td>
            </tr>
            <tr style="background: #f4f4f5;">
              <td style="font-weight: bold; border: 1px solid #e4e4e7;">Proposed Shop Name</td>
              <td style="border: 1px solid #e4e4e7;">${shopName}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; border: 1px solid #e4e4e7;">Niche / Products</td>
              <td style="border: 1px solid #e4e4e7;">${niche}</td>
            </tr>
            <tr style="background: #f4f4f5;">
              <td style="font-weight: bold; border: 1px solid #e4e4e7;">NID / Reg Number</td>
              <td style="border: 1px solid #e4e4e7;">${nidNumber}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; border: 1px solid #e4e4e7;">Product Details</td>
              <td style="border: 1px solid #e4e4e7;">${productDetails}</td>
            </tr>
            <tr style="background: #f4f4f5;">
              <td style="font-weight: bold; border: 1px solid #e4e4e7;">NID Photo</td>
              <td style="border: 1px solid #e4e4e7;"><a href="${nidImage}" target="_blank" style="color: #2563eb; text-decoration: underline;">View Uploaded Photo</a></td>
            </tr>
          </table>
          <p style="margin-top: 25px;">Please log in to the admin panel settings to review, verify, and approve/reject this application.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Seller request email send error:", error);
  }
}

export async function sendSellerRequestStatusEmail(
  customerEmail: string,
  customerName: string,
  shopName: string,
  status: "approved" | "rejected"
) {
  try {
    const isApproved = status === "approved";
    const subject = isApproved 
      ? `Congratulations! Your Seller account is Approved!` 
      : `Seller Account Update: Application Denied`;

    const html = isApproved ? `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7;">
        <h2 style="color: #16a34a; font-weight: 800; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">Seller Account Approved!</h2>
        <p>Dear ${customerName},</p>
        <p>We are thrilled to inform you that your application to become a Seller for <strong>"${shopName}"</strong> on our platform has been <strong>Approved</strong> by the administrator!</p>
        <p>You can now log in to your account and access your new <strong>Seller Panel</strong> dashboard to initialize your storefront, add categories, configure branding, and begin publishing products!</p>
        <p>Thank you for partnering with us.</p>
        <br/>
        <p>Best regards,</p>
        <p>The Ecosystem Team</p>
      </div>
    ` : `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7;">
        <h2 style="color: #dc2626; font-weight: 800; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">Seller Application Status</h2>
        <p>Dear ${customerName},</p>
        <p>We have reviewed your application to become a Seller for <strong>"${shopName}"</strong> on our platform.</p>
        <p>Unfortunately, your application could not be approved at this time. Please make sure that all NID verification details are accurate and comply with platform policies.</p>
        <p>If you have any questions or would like to appeal this decision, please reach out to our customer support.</p>
        <br/>
        <p>Best regards,</p>
        <p>The Ecosystem Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: customerEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error("Seller status update email error:", error);
  }
}
