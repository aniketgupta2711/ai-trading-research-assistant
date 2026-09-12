import { useState } from "react";

// These match the fields our backend stores on the Experiment model.
const FIELD_DEFS = [
  { key: "instrument", label: "Instrument" },
  { key: "timeframe", label: "Timeframe" },
  { key: "entry", label: "Entry condition" },
  { key: "exit", label: "Exit condition" },
  { key: "holdingPeriod", label: "Holding period" },
  { key: "filters", label: "Filters" },
  { key: "question", label: "What you want to find out" },
];

export default function ExperimentCard({ experiment, onClarify, loading }) {
  const [clarifyText, setClarifyText] = useState("");
  const missingSet = new Set(experiment.missing || []);
  const isResolved = experiment.isResolved;

  const handleClarify = () => {
    if (!clarifyText.trim()) return;
    onClarify(clarifyText);
    setClarifyText("");
  };

  return (
    <div className="experiment-card">
      <div className="experiment-header">
        <span>EXPERIMENT</span>
        <span className={isResolved ? "status-ready" : "status-pending"}>
          {isResolved ? "ready to test" : "needs input"}
        </span>
      </div>

      <div className="experiment-fields">
        {FIELD_DEFS.map((f) => {
          const value = experiment[f.key];
          const isMissing = missingSet.has(f.key) || !value;
          return (
            <div className="field-row" key={f.key}>
              <div className="field-label">{f.label}</div>
              <div className={isMissing ? "field-value missing" : "field-value"}>
                {isMissing ? "— not specified" : value}
              </div>
            </div>
          );
        })}
      </div>

      {!isResolved && (
        <div className="clarify-box">
          <div className="clarify-title">Before this is testable, we need:</div>
          <ul>
            {(experiment.clarifyingQuestions || []).map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
          <div className="clarify-input-row">
            <input
              value={clarifyText}
              onChange={(e) => setClarifyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleClarify()}
              placeholder="Answer here…"
            />
            <button onClick={handleClarify} disabled={loading || !clarifyText.trim()}>
              {loading ? "…" : "Update"}
            </button>
          </div>
        </div>
      )}

      {isResolved && (
        <div className="resolved-note">
          Experiment fully specified. In a full system, this would now be
          passed to a backtesting engine.
        </div>
      )}
    </div>
  );
}
