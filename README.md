# AI Trading Research Assistant — Mini Prototype

A small prototype that takes a natural-language market question (e.g. *"Does
buying NIFTY after a 1% fall work better during high-volatility periods?"*)
and converts it into a structured experiment — flagging any information
that's missing instead of silently guessing.

## What this does (in plain terms)

1. User types a question in free text.
2. The backend sends it to an LLM (Claude) with instructions to extract:
   instrument, timeframe, entry condition, exit condition, holding period,
   filters, and the underlying question.
3. If something important is missing (e.g. no exit condition given), the
   system flags it and asks the user directly instead of assuming.
4. The user answers, and the structured experiment updates.
5. Every question and its structured result is saved in MongoDB, so there's
   a history of past research questions.

This does **not** do real backtesting or live trading — that's explicitly
out of scope per the assignment brief.

## Architecture

```
trading-research-assistant/
├── server/              Express + MongoDB backend
│   ├── server.js         Entry point: connects DB, starts server
│   ├── models/
│   │   └── Experiment.js Mongoose schema for a stored experiment
│   ├── controllers/
│   │   └── experimentController.js   Calls Claude API, saves/updates records
│   └── routes/
│       └── experiment.js  POST / PATCH / GET endpoints
│
└── client/               React frontend
    └── src/
        ├── App.js                 Top-level state and layout
        ├── api.js                 Thin wrapper around axios calls to backend
        └── components/
            ├── QuestionInput.jsx   The text box + submit button
            └── ExperimentCard.jsx  The structured "ticket" + clarify flow
```

**Why this split:** the LLM call and the API key live only on the backend
(never exposed to the browser). The frontend just renders whatever
structured JSON the backend returns, and posts clarifying answers back to
the same endpoint.

## Technologies used

- **MongoDB** — stores each parsed experiment (via Mongoose)
- **Express** — REST API (`/api/experiments`)
- **React** — frontend UI (create-react-app style, no extra framework)
- **Node.js** — server runtime
- **Google Gemini API** (free tier) — does the actual question → structure parsing

## How to run this locally

### 1. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and fill in:
- `GEMINI_API_KEY` — get a free key from https://aistudio.google.com/apikey
- `MONGODB_URI` — either a local MongoDB (`mongodb://127.0.0.1:27017/trading_research_assistant`)
  or a free MongoDB Atlas cluster connection string

Then start it:

```bash
npm run dev
```

Server runs on `http://localhost:5000`.

### 2. Frontend setup

In a new terminal:

```bash
cd client
npm install
npm start
```

App opens on `http://localhost:3000`. It automatically forwards `/api/*`
calls to the backend on port 5000 (see the `"proxy"` field in
`client/package.json`).

### 3. Try it

Type a question like:
> Does buying NIFTY after a 1% fall work better during high-volatility periods?

You'll see the structured experiment appear, with any missing fields (like
exit condition or holding period) flagged in red, along with a question
asking you to fill them in.

## Key decisions

- **Why Gemini API instead of a paid LLM?** Used Google's Gemini API since it
  has a generous free tier, which made sense for a small prototype like this.
  The prompt/parsing approach is model-agnostic — swapping in a different LLM
  provider would only mean changing the API call in `experimentController.js`.
- **Why Gemini API directly instead of a chatbot UI?** The assignment
  specifically says not to build "simply a chatbot wrapper." So the AI is
  used as an internal parsing/extraction step, and the user never talks to
  the AI directly — they only see the structured output and the specific
  clarifying question it decided to ask.
- **Why store history in MongoDB?** The brief mentions the eventual system
  should "remember what it learned." Full memory/learning is out of scope
  for this small prototype, but storing every past question is a first
  step toward that, and it's a natural fit for the "M" in MERN.
- **Why not build a backtesting engine?** Explicitly marked optional/bonus
  in the assignment. Left out to keep the scope to what was asked.
- **Why does the API call retry automatically?** The free tier occasionally
  returns transient errors (503 when the model is overloaded, 429 when
  briefly rate-limited). Rather than surfacing these to the user
  immediately, the backend retries up to 3 times with a short backoff, since
  these errors usually resolve within a second or two.

## What I'd improve with more time

- Show the user's past questions (history) in the UI, not just in the database.
- Let the user edit a structured field directly instead of only answering
  free-text clarifying questions.
- Add basic validation/tests around the LLM's JSON output, since LLM
  responses can occasionally be malformed.
- Move the system prompt into a versioned prompt file so it's easier to
  iterate on the extraction quality separately from the rest of the code.

### 2. Frontend setup

In a new terminal:

```bash
cd client
npm install
npm start
```

App opens on `http://localhost:3000`. It automatically forwards `/api/*`
calls to the backend on port 5000 (see the `"proxy"` field in
`client/package.json`).

### 3. Try it

Type a question like:
> Does buying NIFTY after a 1% fall work better during high-volatility periods?

You'll see the structured experiment appear, with any missing fields (like
exit condition or holding period) flagged in red, along with a question
asking you to fill them in.

## Key decisions

- **Why Claude API directly instead of a chatbot UI?** The assignment
  specifically says not to build "simply a chatbot wrapper." So the AI is
  used as an internal parsing/extraction step, and the user never talks to
  the AI directly — they only see the structured output and the specific
  clarifying question it decided to ask.
- **Why store history in MongoDB?** The brief mentions the eventual system
  should "remember what it learned." Full memory/learning is out of scope
  for this small prototype, but storing every past question is a first
  step toward that, and it's a natural fit for the "M" in MERN.
- **Why not build a backtesting engine?** Explicitly marked optional/bonus
  in the assignment. Left out to keep the scope to what was asked.

## What I'd improve with more time

- Show the user's past questions (history) in the UI, not just in the database.
- Let the user edit a structured field directly instead of only answering
  free-text clarifying questions.
- Add basic validation/tests around the LLM's JSON output, since LLM
  responses can occasionally be malformed.
- Move the Claude prompt into a versioned prompt file so it's easier to
  iterate on the extraction quality separately from the rest of the code.
