const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Manu@666',
  database: 'hello',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Serve static files
app.use(express.static(path.join(__dirname, 'views')));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'views' });
});

app.get('/register', (req, res) => {
  res.sendFile('register.html', { root: 'views' });
});

app.post('/register', async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  // Check if passwords match
  if (password !== confirmPassword) {
    console.log('Passwords do not match:', username);
    res.send('Passwords do not match. Please try again.');
    return;
  }

  // Hash the password
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO user (username, password) VALUES (?, ?)';
    db.query(query, [username, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        res.send('Registration failed. Please try again.');
      } else {
        console.log('User registered:', username);
        res.redirect('/login');
      }
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.send('Registration failed. Please try again.');
  }
});

app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: 'views' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM user WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error('Error querying data:', err);
      res.send('Login failed. Please try again.');
    } else {
      if (results.length > 0 && (await bcrypt.compare(password, results[0].password))) {
        console.log('Login successful:', username);
        res.redirect(`/welcome?username=${username}`);
      } else {
        console.log('Login failed:', username);
        res.send('Login failed. Please check your username and password.');
      }
    }
  });
});

app.get('/welcome', (req, res) => {
  res.sendFile('welcome.html', { root: 'views' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});