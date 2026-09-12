const axios = require("axios");
const Experiment = require("../models/Experiment");

// This is the instruction we give the AI every time. It tells the AI exactly
// what shape of JSON to return, so our backend can reliably read the response.
const SYSTEM_PROMPT = `You convert a natural-language trading research question into a structured experiment.

Return ONLY a JSON object, no prose, no markdown fences, with this exact shape:
{
  "instrument": string or null,
  "timeframe": string or null,
  "entry": string or null,
  "exit": string or null,
  "holding_period": string or null,
  "filters": string or null,
  "question": string or null,
  "missing": [array of field keys from: instrument, timeframe, entry, exit, holding_period, filters, question that are null or too vague to test],
  "clarifying_questions": [array of 1-3 short natural questions to ask the user, one per important missing field]
}

Rules:
- Only mark a field null if it genuinely was not stated or implied.
- Do not invent specific numbers (like exact % thresholds) the user didn't give.
- "question" is what the user is ultimately trying to find out (e.g. "Does this have a positive edge?").
- Keep field values short and concrete (a phrase, not a paragraph).`;

// Calls Google's Gemini API (free tier) with the user's text and (optionally)
// what we already know from a previous turn, so follow-up answers get merged
// into the same experiment.
async function askClaude(userText, priorState, attempt = 1) {
  const contextNote = priorState
    ? `\n\nPreviously extracted (may be incomplete): ${JSON.stringify(
        priorState
      )}. The user is now providing additional/clarifying info. Merge it in and re-return the full structure.`
    : "";

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
      {
        contents: [
          {
            parts: [{ text: userText }],
          },
        ],
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT + contextNote }],
        },
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
      }
    );

    const textBlock =
      response.data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("") || "";

    const cleaned = textBlock.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    const status = err.response?.status;
    const isTransient = status === 503 || status === 429;

    if (isTransient && attempt < 3) {
      const waitMs = attempt * 1000;
      console.log(
        `Gemini returned ${status}, retrying (attempt ${attempt + 1}) after ${waitMs}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      return askClaude(userText, priorState, attempt + 1);
    }

    throw err;
  }
}

// POST /api/experiments  - create a fresh experiment from a brand new question
exports.createExperiment = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Question is required" });
    }

    const parsed = await askClaude(question, null);

    const experiment = await Experiment.create({
      rawQuestion: question,
      instrument: parsed.instrument,
      timeframe: parsed.timeframe,
      entry: parsed.entry,
      exit: parsed.exit,
      holdingPeriod: parsed.holding_period,
      filters: parsed.filters,
      question: parsed.question,
      missing: parsed.missing || [],
      clarifyingQuestions: parsed.clarifying_questions || [],
      isResolved: (parsed.missing || []).length === 0,
    });

    res.status(201).json(experiment);
  } catch (err) {
    console.error("createExperiment error:", err.message);
    res.status(500).json({ error: "Failed to parse question" });
  }
};

// PATCH /api/experiments/:id - merge a clarifying answer into an existing experiment
exports.updateExperiment = async (req, res) => {
  try {
    const { id } = req.params;
    const { clarification } = req.body;

    const existing = await Experiment.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Experiment not found" });
    }

    const priorState = {
      instrument: existing.instrument,
      timeframe: existing.timeframe,
      entry: existing.entry,
      exit: existing.exit,
      holding_period: existing.holdingPeriod,
      filters: existing.filters,
      question: existing.question,
    };

    const parsed = await askClaude(clarification, priorState);

    existing.instrument = parsed.instrument;
    existing.timeframe = parsed.timeframe;
    existing.entry = parsed.entry;
    existing.exit = parsed.exit;
    existing.holdingPeriod = parsed.holding_period;
    existing.filters = parsed.filters;
    existing.question = parsed.question;
    existing.missing = parsed.missing || [];
    existing.clarifyingQuestions = parsed.clarifying_questions || [];
    existing.isResolved = (parsed.missing || []).length === 0;

    await existing.save();
    res.json(existing);
  } catch (err) {
    console.error("updateExperiment error:", err.message);
    res.status(500).json({ error: "Failed to update experiment" });
  }
};

// GET /api/experiments - list past experiments (history / "what the system remembers")
exports.listExperiments = async (req, res) => {
  try {
    const experiments = await Experiment.find().sort({ createdAt: -1 }).limit(20);
    res.json(experiments);
  } catch (err) {
    console.error("listExperiments error:", err.message);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};