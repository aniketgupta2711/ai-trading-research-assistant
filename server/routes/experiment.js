const express = require("express");
const router = express.Router();
const {
  createExperiment,
  updateExperiment,
  listExperiments,
} = require("../controllers/experimentController");

// POST /api/experiments        -> ask a new question
router.post("/", createExperiment);

// PATCH /api/experiments/:id   -> answer a clarifying question
router.patch("/:id", updateExperiment);

// GET /api/experiments         -> past questions (history)
router.get("/", listExperiments);

module.exports = router;
