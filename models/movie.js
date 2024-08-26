const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    posterURL: {
        type: String,
        required: true
    },
    releaseDate: {
        type: Date, 
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    review: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Movie', movieSchema);
