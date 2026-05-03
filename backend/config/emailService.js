const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderConfirmation = async (order) => {
  const { customer_name, customer_email, items, total, _id, payment_method, estimated_delivery_date, customer_address } = order;

  const productListHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
        <span style="font-weight: 600; color: #2d3748;">${item.name}</span><br>
        <span style="font-size: 12px; color: #718096;">Qty: ${item.quantity}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; color: #2d3748;">
        ₹${item.price * item.quantity}
      </td>
    </tr>
  `
    )
    .join("");

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #4a5568; background-color: #f7fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; color: white; }
        .content { padding: 30px; }
        .order-id { font-size: 14px; color: #a0aec0; margin-bottom: 5px; }
        .total-row { font-size: 18px; font-weight: bold; color: #1a202c; }
        .button { display: inline-block; padding: 12px 30px; background-color: #10b981; color: white; text-decoration: none; border-radius: 30px; font-weight: 600; margin-top: 20px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #a0aec0; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; border-top: 1px solid #edf2f7; pt: 20px; }
        .detail-item { font-size: 13px; }
        .detail-label { color: #718096; margin-bottom: 4px; }
        .detail-value { font-weight: 600; color: #2d3748; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">Thank you for your order!</h1>
          <p style="margin: 5px 0 0; opacity: 0.9;">We've received your order and are getting it ready.</p>
        </div>
        <div class="content">
          <p class="order-id">Order #${_id}</p>
          <h2 style="color: #2d3748; margin-top: 0;">Hi ${customer_name},</h2>
          <p>Your healing herbs are being prepared for shipment. Here's a summary of your purchase:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="text-align: left; font-size: 12px; text-transform: uppercase; color: #a0aec0; border-bottom: 2px solid #edf2f7;">
                <th style="padding-bottom: 10px;">Product</th>
                <th style="padding-bottom: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${productListHtml}
              <tr>
                <td style="padding: 20px 0 0; font-weight: bold;">Total Amount</td>
                <td style="padding: 20px 0 0; text-align: right;" class="total-row">₹${total}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px;">
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-size: 12px; color: #718096; text-transform: uppercase;">Shipping Address</p>
              <p style="margin: 4px 0 0; font-weight: 500; color: #2d3748;">${customer_address}</p>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <div>
                <p style="margin: 0; font-size: 12px; color: #718096; text-transform: uppercase;">Payment Method</p>
                <p style="margin: 4px 0 0; font-weight: 500; color: #2d3748;">${payment_method}</p>
              </div>
              <div>
                <p style="margin: 0; font-size: 12px; color: #718096; text-transform: uppercase;">Est. Delivery</p>
                <p style="margin: 4px 0 0; font-weight: 500; color: #2d3748;">${estimated_delivery_date ? new Date(estimated_delivery_date).toLocaleDateString() : "3-5 Business Days"}</p>
              </div>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="http://localhost:8080/orders/${_id}" class="button">Track Your Order</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2024 Herbs Store. All rights reserved.</p>
          <p>If you have any questions, reply to this email or contact us at support@herbsstore.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Herbs Store" <${process.env.EMAIL_USER}>`,
    to: customer_email,
    bcc: process.env.ADMIN_EMAIL,
    subject: `Order Confirmation - #${_id}`,
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Herbs Store" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Order Verification OTP",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #10b981; text-align: center;">Herbs Store</h2>
        <p>Hi,</p>
        <p>Please use the following One-Time Password (OTP) to verify your order. This OTP is valid for 10 minutes.</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 8px;">
          ${otp}
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #777;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP Email sent to " + email);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};

module.exports = { sendOrderConfirmation, sendOtpEmail };
