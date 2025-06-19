const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const MongoStore = require('connect-mongo');

const app = express();
const expressLayouts = require('express-ejs-layouts'); 

app.use(expressLayouts); 
app.set('layout', 'layout');

mongoose.connect('mongodb://localhost:27017/worldcountries', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(session({
  secret: 'secret_key_12345',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/gossip' }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(flash());

// Передаём flash-сообщения во все шаблоны
app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

app.use((req, res, next) => {
  res.locals.userId = req.session.userId;
  res.locals.isAdmin = req.session.isAdmin;
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');


app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/posts', postRoutes); // для добавления постов



app.use((req, res) => {
  res.status(404).render('404', { title: 'Страница не найдена' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
