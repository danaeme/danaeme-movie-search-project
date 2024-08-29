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

      // Update the movies array in the User model
      const user = await User.findById(req.user._id);
      if (!user) {
          return res.status(404).json({ error: 'User not found.' });
      }
      user.movies.push(movie._id);
      await user.save();

      res.status(201).json(movie);
  } catch (error) {
      console.error("Error creating movie:", error); // Log detailed error
      res.status(500).json({ error: 'Failed to create movie.' });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
      const movies = await Movie.find({ createdBy: req.user._id })
          .populate('createdBy')
          .sort({ createdAt: 'desc' });
      if (!movies) {
          return res.status(404).json({ error: 'Movies not found.' });
      }
      res.status(200).json(movies);
  } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).json({ error: 'Failed to fetch movies.' });
  }
});


// GET /movies/:movieId
router.get('/:movieId', async (req, res) => {
    try {
      const foundMovie = await Movie.findById(req.params.movieId)
      .populate('createdBy')  // populate user who created the movie
      .populate({
          path: 'comments',
          populate: { path: 'user' }  // populate user who made the comment
      });
      if (!foundMovie) {
        res.status(404);
        throw new Error('Movie not found.');
      }
      res.status(200).json(foundMovie);
    } catch (error) {
      if (res.statusCode === 404) {
        res.json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
});

// DELETE /movies/:movieId
router.delete('/:movieId', verifyToken, async (req, res) => {
    try {
      const movieToDelete = await Movie.findById(req.params.movieId);
  
      // Check if movie exists and logged in user is the creator
      if (!movieToDelete) {
        res.status(404);
        throw new Error('Movie not found.');
      }
  
      if (movieToDelete.createdBy.toString() !== req.user._id) {
        res.status(401);
        throw new Error('You can only delete your own movies!');
      }
  
      // deleteOne to remove the movie
      await Movie.deleteOne({ _id: req.params.movieId });
  
      // Remove movie reference from user's movies 
      const user = await User.findById(req.user._id);
      user.movies = user.movies.filter(m => m.toString() !== req.params.movieId);
      await user.save();
  
      res.status(200).json({ message: 'Movie deleted successfully.' });
    } catch (error) {
      if (res.statusCode === 404 || res.statusCode === 401) {
        res.json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
});

// UPDATE /movies/:movieId
router.put('/:movieId', verifyToken, async (req, res) => {
    try {
      // Find movie ID and update it with the request body
      const updatedMovie = await Movie.findByIdAndUpdate(req.params.movieId, req.body, {
        new: true, // Return the updated movie 
      });
  
      if (!updatedMovie) {
        res.status(404);
        throw new Error('Movie not found.');
      }
  
      // If user is not the creator return a 401 error
      if (updatedMovie.createdBy.toString() !== req.user._id) {
        res.status(401);
        throw new Error('You can only update your own movies.');
      }
  
      // Return updated movie
      res.status(200).json(updatedMovie);
    } catch (error) {
      // errors
      if (res.statusCode === 404 || res.statusCode === 401) {
        res.json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
});
  

module.exports = router;
