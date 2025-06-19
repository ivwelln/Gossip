const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate('author');
    res.render('index', {
  title: 'Сплетница',
  posts: posts.map(p => ({
    _id: p._id,
    content: p.content,
    imagePaths: p.imagePaths,
    authorName: p.author?.username || 'Аноним',
    authorImage: p.author?.profileImage || '/images/default-avatar.png',
    createdAt: p.createdAt
  })),
  isAdmin: req.session.isAdmin,
  userId: req.session.userId
});
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка загрузки главной страницы');
  }
});

module.exports = router;