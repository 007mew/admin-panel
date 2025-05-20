require('dotenv').config();  // Load .env variables

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const Article = require('./models/Article');

const app = express();

// Use PORT from env or default 3000
const PORT = process.env.PORT || 3000;

// ----- MongoDB Connection -----
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ----- Middleware -----
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ----- CORS Configuration -----
const allowedOrigins = [
  'https://admin.cabnm.co.in',
  'http://localhost:3000',
  'http://localhost:5500',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl or mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));  // enable pre-flight requests for all routes

// ----- Session middleware config - use secret from env -----
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: true,
}));

// ----- Dummy Admin Credentials -----
const ADMIN_USER = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123',
};

// ----- Auth Middleware -----
function authMiddleware(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect('/');
  }
}

// ----- HTML Routes -----
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/dashboard', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/create', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'create.html'));
});

app.get('/edit/:id', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'edit.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// ----- Login -----
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
    req.session.loggedIn = true;
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

// ----- API Routes -----
app.get('/api/articles', async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching articles', error: err });
  }
});

app.post('/api/articles', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const article = new Article({ title, content });
  try {
    await article.save();
    res.redirect('/dashboard');
  } catch (err) {
    res.status(500).json({ message: 'Error saving article', error: err });
  }
});

app.put('/api/articles/:id', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  try {
    await Article.findByIdAndUpdate(req.params.id, { title, content });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ message: 'Error updating article', error: err });
  }
});

app.delete('/api/articles/:id', authMiddleware, async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ message: 'Error deleting article', error: err });
  }
});

// ----- Start Server -----
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
