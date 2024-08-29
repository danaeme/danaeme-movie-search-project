const express = require('express');
const router = express.Router();
const User = require('../models/user');
const verifyToken = require('../middleware/verify-token');

router.get('/:userId', verifyToken, async (req, res) => {
    try {
        if (req.user._id !== req.params.userId) {
            return res.status(401).json({ error: "Unauthorized access." });
        }
        const user = await User.findById(req.user._id).populate({
            path: 'movies',
            populate: { path: 'comments' } // Populate comments within movies
        });
        if (!user) {
            return res.status(404).json({ error: 'Profile not found.' });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ error: 'Failed to fetch profile.' });
    }
});

module.exports = router;