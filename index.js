const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Score = require('./models/Score');

const app = express();
app.use(cors());
app.use(express.json());

// Replace this with your actual MongoDB Atlas connection string
mongoose.connect('mongodb+srv://hemalathavalli:harshitha@cluster0.g3oy8t9.mongodb.net/motionplay?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Fetch all scores
app.get('/scores', async (req, res) => {
  const scores = await Score.find().sort({ score: -1 });
  res.json(scores);
});

// Submit new score
app.post('/submit-score', async (req, res) => {
  const { name, score } = req.body;
  const newScore = new Score({ name, score });
  await newScore.save();
  res.json({ message: "Score saved!" });
});

app.listen(5000, () => console.log("Backend running on port 5000"));

