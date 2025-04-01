require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors'); // Добавляем cors

const app = express();

// Настраиваем CORS
app.use(cors({
  origin: 'http://localhost:5173', // Разрешаем запросы только с этого адреса
  methods: ['GET', 'POST'], // Разрешаем методы
  allowedHeaders: ['Content-Type', 'Authorization'], // Разрешаем заголовки
}));

app.use(bodyParser.json());

const SECRET_KEY = process.env.JWT_SECRET;
let users = [];

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
  }
  const newUser = { id: users.length + 1, username, password };
  users.push(newUser);
  res.status(201).json({ message: 'Регистрация прошла успешно' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Неверные имя пользователя или пароль' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

app.get('/protected', authenticateJWT, (req, res) => {
  res.json({ message: 'Это защищенные данные', user: req.user });
});

app.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});