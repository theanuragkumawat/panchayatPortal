// backend/models/Problem.js
const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: String,
    description: String,
    location: String,
    urgency: { type: String, enum: ['High', 'Medium', 'Low'] },
    status: { type: String, default: 'Pending' }
});

module.exports = mongoose.model('Problem', problemSchema);