const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const Movie = require('../models/movie');
const verifyToken = require('../middleware/verify-token');


const SALT_LENGTH = 12;

router.post('/signup', async (req, res) => {
    try {
        const userInDatabase = await User.findOne({ username: req.body.username });
        if (userInDatabase) {
            return res.json({error: 'Username already taken.'});
        }
        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            bio: req.body.bio || '',
            profilePic: req.body.profilePic || '',
            hashedPassword: bcrypt.hashSync(req.body.password, SALT_LENGTH)
        })
        const token = jwt.sign({ username: user.username, _id: user._id }, process.env.JWT_SECRET);
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/signin', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (user && bcrypt.compareSync(req.body.password, user.hashedPassword)) {
            const token = jwt.sign({ username: user.username, _id: user._id }, process.env.JWT_SECRET);
            res.status(200).json({ token });
        } else {
            res.status(401).json({ error: 'Invalid username or password.' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/search', verifyToken, async (req, res) => {
    const { query } = req.query;
    try {
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('username email');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:userId', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate({
                path: 'movies',
                populate: { path: 'comments', populate: { path: 'user' } } 
            });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:userId', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        user.bio = req.body.bio || user.bio;

        if (req.body.password) {
            user.hashedPassword = bcrypt.hashSync(req.body.password, SALT_LENGTH);
        }

        await user.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:userId', verifyToken, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        await Movie.deleteMany({ createdBy: user._id });

        res.status(200).json({ message: 'User deleted.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;