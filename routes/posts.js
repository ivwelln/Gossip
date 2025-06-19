const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const uploadImages = require('../middleware/upload');
const Post = require('../models/Post');

router.post('/', isAuthenticated, uploadImages, async (req, res) => {
  try {
    const imagePaths = req.files.map(file => `/uploads/${file.filename}`);

    const post = new Post({
      content: req.body.content,
      author: req.session.userId,
      imagePaths
    });

    await post.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при создании сплетни');
  }
});

module.exports = router;