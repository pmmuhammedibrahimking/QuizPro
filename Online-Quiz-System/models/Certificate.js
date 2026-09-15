const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    grade: {
        type: String,
        required: true
    },
    certId: {
        type: String,
        required: true,
        unique: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Certificate', CertificateSchema);
