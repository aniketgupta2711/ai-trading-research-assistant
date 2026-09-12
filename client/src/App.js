import { useState } from "react";
import QuestionInput from "./components/QuestionInput";
import ExperimentCard from "./components/ExperimentCard";
import { createExperiment, updateExperiment } from "./api";

export default function App() {
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAsk = async (question) => {
    setLoading(true);
    setError(null);
    try {
      const data = await createExperiment(question);
      setExperiment(data);
    } catch (err) {
      setError("Couldn't parse that. Try rephrasing your question.");
    } finally {
      setLoading(false);
    }
  };

  const handleClarify = async (clarification) => {
    setLoading(true);
    setError(null);
    try {
      const data = await updateExperiment(experiment._id, clarification);
      setExperiment(data);
    } catch (err) {
      setError("Couldn't update the experiment. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setExperiment(null);
    setError(null);
  };

  return (
    <div className="app">
      <div className="app-inner">
        <div className="app-header">
          <div className="eyebrow">Research desk</div>
          <h1>Turn a market question into a testable experiment</h1>
          <p>
            Ask something in plain language. We'll structure it into an
            experiment and flag anything we need from you before it's
            testable.
          </p>
        </div>

        {!experiment && (
          <>
            <QuestionInput onSubmit={handleAsk} loading={loading} />
            {error && <div className="error-text">{error}</div>}
          </>
        )}

        {experiment && (
          <>
            <ExperimentCard
              experiment={experiment}
              onClarify={handleClarify}
              loading={loading}
            />
            {error && <div className="error-text">{error}</div>}
            <button className="reset-button" onClick={reset}>
              Ask a new question
            </button>
          </>
        )}
      </div>
    </div>
  );
}
