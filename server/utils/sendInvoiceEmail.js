import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendInvoiceEmail = async ({ email, name, plan, amount }) => {
  const html = `
    <h2>Payment Successful 🎉</h2>
    <p>Hello <b>${name}</b>,</p>
    <p>Your <b>${plan.toUpperCase()}</b> plan is active.</p>

    <h3>Invoice</h3>
    <p>Plan: ${plan}</p>
    <p>Amount Paid: ₹${amount}</p>
    <p>Status: PAID</p>

    <p>Thank you ❤️</p>
  `;

  await transporter.sendMail({
    from: `"YouTube Clone" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Invoice - Subscription Activated",
    html,
  });
};
