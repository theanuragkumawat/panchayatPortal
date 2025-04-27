// backend/models/Problem.js
const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: Number },
    title: String,
    description: String,
    urgency: { type: String, enum: ['High', 'Medium', 'Low'] },
    status: { type: String, default: 'Pending' },
    pincode: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    area: {
        type: String,
    },
    addressLine: {
        type: String,
    },
    ProblemImages: {
        type: Array,
    },
});

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;