import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for sending results
  app.post("/api/send-results", async (req, res) => {
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
      secure: false, // true for 465, false for other ports
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
            ${tips?.map((tip: string) => `<li>${tip}</li>`).join("") || ""}
          </ul>
          <h3>Suggested Products:</h3>
          <ul>
            ${products?.map((p: any) => `<li><strong>${p.name}</strong>: ${p.description}</li>`).join("") || ""}
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
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
