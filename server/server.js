require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const experimentRoutes = require("./routes/experiment");

const app = express();

const key = process.env.GEMINI_API_KEY || "";
console.log(`GEMINI_API_KEY loaded: length=${key.length}, starts="${key.slice(0, 6)}", ends="${key.slice(-4)}"`);



app.use(cors());
app.use(express.json());

// All experiment-related endpoints live under /api/experiments
app.use("/api/experiments", experimentRoutes);

app.get("/", (req, res) => {
  res.send("AI Trading Research Assistant API is running.");
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
