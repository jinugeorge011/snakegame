const express = require("express");
const router = express.Router();
const Score = require("../models/score");

// Get top 10 scores
router.get("/", async (req, res) => {
  try {
    const scores = await Score.find().sort({ score: -1 }).limit(10);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new score
router.post("/", async (req, res) => {
  const { name, score } = req.body;

  if (!name || score == null) {
    return res.status(400).json({ message: "Name and score are required." });
  }

  const newScore = new Score({ name, score });

  try {
    const savedScore = await newScore.save();
    res.status(201).json(savedScore);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
