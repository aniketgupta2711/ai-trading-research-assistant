import { useState } from "react";

// Simple controlled textarea + submit button.
// Parent (App.js) decides what happens with the submitted text.
export default function QuestionInput({ onSubmit, loading }) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text);
  };

  return (
    <div className="question-input">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. Does buying NIFTY after a 1% fall work better during high-volatility periods?"
        rows={3}
      />
      <button onClick={handleSubmit} disabled={loading || !text.trim()}>
        {loading ? "Structuring…" : "Structure this question"}
      </button>
    </div>
  );
}
