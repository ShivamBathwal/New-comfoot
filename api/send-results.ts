import nodemailer from "nodemailer";

export default async function handler(req: any, res: any) {
  // Add CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, resultTitle, explanation, tips, products } = req.body;
  if (!email || !resultTitle) {
    return res.status(400).json({ error: "Email and result title are required" });
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials not configured. Skipping email send.");
    return res.status(200).json({ message: "Email simulation successful (SMTP not configured)" });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"Comfoot Analysis" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Your Foot Health Analysis: ${resultTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #2D241E;">
        <h1 style="color: #FF6321;">Comfoot Analysis</h1>
        <h2>Your Result: ${resultTitle}</h2>
        <p>${explanation}</p>
        <h3>Recommended Tips:</h3>
        <ul>
          ${tips.map((tip: string) => `<li>${tip}</li>`).join("")}
        </ul>
        <h3>Suggested Products:</h3>
        <ul>
          ${products.map((p: any) => `<li><strong>${p.name}</strong>: ${p.description}</li>`).join("")}
        </ul>
        <p style="font-size: 12px; color: #8E8279; margin-top: 40px;">
          This is an automated report. For professional medical advice, please consult a podiatrist.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Results sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
}
