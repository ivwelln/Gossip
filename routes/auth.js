const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

const storage = multer.diskStorage({
  destination: 'public/uploads',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Регистрация
router.get('/register', (req, res) => {
  res.render('auth/register', 
    {
  title: 'Сплетница'
});
});

router.post('/register', upload.single('profileImage'), async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).send('Пароли не совпадают');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      profileImage: req.file ? `/uploads/${req.file.filename}` : undefined
    });
    await user.save();

    req.session.userId = user._id;
    req.session.isAdmin = user.isAdmin;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при регистрации');
  }
});

// Вход
router.get('/login', (req, res) => {
  res.render('auth/login', {
  title: 'Сплетница'
});
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Пользователь не найден');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).send('Неверный пароль');

    req.session.userId = user._id;
    req.session.isAdmin = user.isAdmin;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка входа');
  }
});

// Выход
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;