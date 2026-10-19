require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const Journal = require("./model/Journal");
const journalRouter = require("./router/journalRouter");

const app = express();
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://664259022-7153403-final-3.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Journals API is running",
  });
});

app.use("/api/journals", journalRouter);

app.use((req, res) => {
  res.status(404).json({ message: "ไม่พบเส้นทางที่ร้องขอ" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "รูปแบบ JSON ไม่ถูกต้อง" });
  }

  console.error(error);
  return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("เชื่อมต่อฐานข้อมูลสำเร็จ");

    // สร้างตารางหากยังไม่มี ไม่ลบตารางเดิม
    await Journal.sync();

    console.log("ตรวจสอบตาราง journals สำเร็จ");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("ไม่สามารถเริ่มระบบได้:", error.message);
    process.exit(1);
  }
}

startServer();
