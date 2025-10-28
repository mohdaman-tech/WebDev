const mongoose = require('mongoose');
module.exports = mongoose.model('Score', new mongoose.Schema({ score: Number, character: Number, date: Date }));
