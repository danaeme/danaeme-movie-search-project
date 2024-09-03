const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const Movie = require('../models/movie');
const verifyToken = require('../middleware/verify-token');

// Add a new comment to a movie
router.post('/:movieId/comments', verifyToken, async (req, res) => {
    try {
        req.body.user = req.user._id;
        req.body.movie = req.params.movieId;

        const comment = await Comment.create(req.body);
        const movie = await Movie.findById(req.params.movieId);
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found.' });
        }
        movie.comments.push(comment._id);
        await movie.save();

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ error});
    }
});


// Get a specific comment
router.get('/:movieId/comments/:commentId', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId)
            .populate('user')
            .populate('movie');
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found.' });
        }
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a comment
router.put('/:movieId/comments/:commentId', verifyToken, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found.' });
        }

        if (comment.user.toString() !== req.user._id) {
            return res.status(401).json({ error: 'You can only edit your own comment.' });
        }
        comment.comment = req.body.comment || comment.comment;
        await comment.save();

        res.status(200).json({ message: 'Comment updated.', comment });
    } catch (err) {
        res.status(500).json(error);
    }
});

// Delete a comment
router.delete('/:movieId/comments/:commentId', verifyToken, async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.movieId);
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found.' });
        }
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found.' });
        }

        if (comment.user.toString() !== req.user._id) {
            return res.status(401).json({ error: 'You can only delete your own comment.' });
        }

        movie.comments.pull(req.params.commentId);
        await movie.save();
        await Comment.deleteOne({ _id: req.params.commentId });

        res.status(200).json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json(error);
    }
});

module.exports = router;