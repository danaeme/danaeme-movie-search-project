const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const Movie = require('../models/movie');
const User = require('../models/user');
const verifyToken = require('../middleware/verify-token');

// router.get('/test', (req, res) => {
//     res.status(200).json({ message: 'Test is working' });
// });
  

router.post('/:movieId/comments', verifyToken, async (req, res) => {
    try {
        req.body.user = req.user._id;

        const comment = await Comment.create(req.body);

        // Find the movie and push the comment to the array
        const movie = await Movie.findById(req.params.movieId);
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found.' });
        }
        movie.comments.push(comment._id);
        await movie.save();

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Get a specific comment
router.get('/:movieId/comments/:commentId', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId)
            .populate('user')
            .populate('movie');
        if (!comment) {
            res.status(404);
            throw new Error('Comment not found.');
        }
        res.status(200).json(comment);
    } catch (error) {
        if (res.statusCode === 404) {
            res.json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
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

        comment.text = req.body.text || comment.text;
        await comment.save();

        res.status(200).json({ message: 'Comment updated.' });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete a comment
router.delete('/:movieId/comments/:commentId', verifyToken, async (req, res) => {
    try {
        // Find the movie
        const movie = await Movie.findById(req.params.movieId);
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found.' });
        }

        // Find and remove comment from the array
        movie.comments.pull(req.params.commentId);
        await movie.save();

        // Delete the comment 
        await Comment.deleteOne({ _id: req.params.commentId });

        res.status(200).json({ message: 'Comment deleted.' });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
