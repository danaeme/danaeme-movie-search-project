const express = require('express');
const router = express.Router();
const User = require('../models/user');
const verifyToken = require('../middleware/verify-token');

router.get('/:userId', verifyToken, async (req, res) => {
    try {
        if (req.user._id !== req.params.userId) {
            return res.status(401).json({ error: "Unauthorized." });
        }
        const user = await User.findById(req.user._id).populate({
            path: 'movies',
            populate: { path: 'comments' } 
        });
        if (!user) {
            return res.status(404).json({ error: 'Profile not found.' });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

module.exports = router;