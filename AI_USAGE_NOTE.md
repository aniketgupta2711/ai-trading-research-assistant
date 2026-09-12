# AI Usage Note

> Fill this in with your own words before submitting. A rough starting
> point is below — edit it to reflect what you actually did and decided.

**Which AI tools did you use?**
Claude (Anthropic) — used both to help scaffold this MERN project and as
the LLM that powers the question-parsing feature itself (called via the
`/v1/messages` API from the Express backend).

**What did you use them for?**
- Generating the initial project structure (Express routes, Mongoose
  model, React components) to save time on boilerplate.
- Designing the system prompt that extracts structured fields (instrument,
  entry, exit, etc.) from a free-text question.
- Writing the CSS/styling for the "experiment ticket" UI.

**What parts did you personally design / decide?**
- [Fill in: e.g. "I decided which fields the experiment schema should
  have, based on re-reading the assignment brief."]
- [Fill in: e.g. "I decided the clarify flow should show the missing
  fields inline in the same card rather than as a popup."]
- [Fill in: e.g. "I decided to store history in MongoDB even though it
  wasn't strictly required, because the brief mentioned 'remember what
  it learned.'"]

**Did you reject or modify any AI-generated suggestions? Why?**
- [Fill in with anything you changed — e.g. "I simplified the prompt
  because the first version asked for too many clarifying questions at
  once," or "I removed a feature suggestion for live stock data since
  the brief says mock/sample data is fine."]

**What part of the solution are you most proud of?**
- [Fill in — e.g. "The clarify flow, because it avoids the system quietly
  assuming an exit condition or holding period the user never specified."]
