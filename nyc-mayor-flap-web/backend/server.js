const express = require('express'), mongoose = require('mongoose'), cors = require('cors'), bodyParser = require('body-parser');
const app = express(); app.use(cors()); app.use(bodyParser.json());

// MongoDB Atlas Free – Replace with your connection string (signup at mongodb.com/atlas)
mongoose.connect('mongodb+srv://yourfreecluster.mongodb.net/nycflap?retryWrites=true&w=majority');

// Schema
const scoreSchema = new mongoose.Schema({ score: Number, character: Number, date: { type: Date, default: Date.now } });
const Score = mongoose.model('Score', scoreSchema);

// Routes
app.get('/api/scores', async (req, res) => {
    const topScores = await Score.find().sort({ score: -1 }).limit(10);
    res.json(topScores);
});
app.post('/api/scores', async (req, res) => {
    const newScore = new Score(req.body);
    await newScore.save();
    res.json({ success: true });
});

app.listen(3000, () => console.log('Backend live on 3000 – High scores global!'));
