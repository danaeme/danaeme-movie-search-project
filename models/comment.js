const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true
    },
    comment: {
      type: String,
      required: true
    }
  });

module.exports = mongoose.model('Comment', commentSchema);
