const mongoose = require("mongoose");

// This is the "M" in MERN - MongoDB stores every question the user has ever
// asked, along with how the AI structured it. This lets us show history later,
// and lets the AI "remember what it learned" (mentioned in the assignment brief)
// even though full memory/learning is out of scope for this small prototype.
const experimentSchema = new mongoose.Schema(
  {
    rawQuestion: {
      type: String,
      required: true,
    },
    instrument: String,
    timeframe: String,
    entry: String,
    exit: String,
    holdingPeriod: String,
    filters: String,
    question: String,
    missing: [String], // field names that are still unresolved
    clarifyingQuestions: [String],
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

module.exports = mongoose.model("Experiment", experimentSchema);
