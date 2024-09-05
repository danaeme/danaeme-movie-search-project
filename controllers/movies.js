const express = require('express');
const router = express.Router();
const Movie = require('../models/movie');
const User = require('../models/user');
const verifyToken = require('../middleware/verify-token');

router.use(verifyToken);

router.post('/', verifyToken, async (req, res) => {
  try {
      req.body.createdBy = req.user._id;
      const movie = await Movie.create(req.body);

      const user = await User.findById(req.user._id);
      if (!user) {
          return res.status(404).json(error);
      }
      user.movies.push(movie._id);
      await user.save();

      res.status(201).json(movie);
  } catch (error) {
      res.status(500).json(error);
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
      const movies = await Movie.find({ createdBy: req.user._id })
          .populate('createdBy')
          .sort({ createdAt: 'desc' });
      if (!movies) {
          return res.status(404).json(error);
      }
      res.status(200).json(movies);
  } catch (error) {
      res.status(500).json(error);
  }
});


router.get('/:movieId', async (req, res) => {
  try {
    const foundMovie = await Movie.findById(req.params.movieId)
      .populate('createdBy')
      .populate({
        path: 'comments',
        populate: { path: 'user' }  
      });
    if (!foundMovie) {
      res.status(404).json(error);
    } else {
      res.status(200).json(foundMovie);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get('/users/:userId/movies', verifyToken, async (req, res) => {
  try {
      const movies = await Movie.find({ createdBy: req.params.userId })
          .populate('createdBy')
          .sort({ createdAt: 'desc' });
      if (!movies.length) {
          return res.status(404).json(error);
      }
      res.status(200).json(movies);
  } catch (error) {
      res.status(500).json(error);
  }
});

router.delete('/:movieId', verifyToken, async (req, res) => {
    try {
      const movieToDelete = await Movie.findById(req.params.movieId);
  
      if (!movieToDelete) {
        res.status(404);
        throw new Error('Movie not found.');
      }
  
      if (movieToDelete.createdBy.toString() !== req.user._id) {
        res.status(401);
        throw new Error('You can only delete your own movies!');
      }
  
      await Movie.deleteOne({ _id: req.params.movieId });
  
      const user = await User.findById(req.user._id);
      user.movies = user.movies.filter(m => m.toString() !== req.params.movieId);
      await user.save();
  
      res.status(200).json({ message: 'Movie deleted successfully' });
    } catch (error) {
      res.status(500).json(error);
    }
});

router.put('/:movieId', verifyToken, async (req, res) => {
    try {
      const updatedMovie = await Movie.findByIdAndUpdate(req.params.movieId, req.body, { new: true, });
  
      if (!updatedMovie) {
        res.status(404);
        throw new Error('Movie not found.');
      }
  
      if (updatedMovie.createdBy.toString() !== req.user._id) {
        res.status(401);
        throw new Error('Only update your own movies!');
      }
  
     
      res.status(200).json(updatedMovie);
    } catch (error) {
      res.status(500).json(error);
    }
});
  

module.exports = router;
