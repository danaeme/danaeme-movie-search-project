const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const testJWTRouter = require('./controllers/test-jwt');
const usersRouter = require('./controllers/users');
const profilesRouter = require('./controllers/profiles');
const moviesRouter = require('./controllers/movies');
const commentsRouter = require('./controllers/comments');

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(cors());
app.use(express.json());



// Routes go here
app.use('/test-jwt', testJWTRouter);
app.use('/users', usersRouter);
app.use('/profiles', profilesRouter);
app.use('/movies', moviesRouter);
app.use('/movies', commentsRouter);

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found.' });
});

app.listen(3000, () => {
    console.log('The express app is ready!');
});