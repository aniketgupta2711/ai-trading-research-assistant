import axios from "axios";

// In development, create-react-app's "proxy" field (see package.json) forwards
// this to http://localhost:5000. In production, set this to your deployed
// backend URL, e.g. via an environment variable.
const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://ai-trading-research-assistant-mpor.onrender.com/api/experiments";

export async function createExperiment(question) {
  const res = await axios.post(API_BASE, { question });
  return res.data;
}

export async function updateExperiment(id, clarification) {
  const res = await axios.patch(`${API_BASE}/${id}`, { clarification });
  return res.data;
}

export async function fetchHistory() {
  const res = await axios.get(API_BASE);
  return res.data;
}
