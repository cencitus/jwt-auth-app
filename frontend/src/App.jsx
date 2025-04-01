import React, { useState } from 'react';
import axios from 'axios';
import AuthForm from './components/AuthForm';
import './App.css';

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  const [protectedData, setProtectedData] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? '/register' : '/login';
    const url = `http://localhost:3000${endpoint}`;
    try {
      const response = await axios.post(url, { username, password });
      if (!isRegister) {
        const { token } = response.data;
        setToken(token);
        setMessage('Успешный вход');
        setError(false);
        // Очищаем поля после входа
        setUsername('');
        setPassword('');
      } else {
        setMessage('Регистрация прошла успешно');
        setError(false);
        // Очищаем поля после регистрации
        setUsername('');
        setPassword('');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Ошибка');
      setError(true);
    }
  };

  const getProtected = async () => {
    try {
      const response = await axios.get('http://localhost:3000/protected', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProtectedData(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setProtectedData(error.response?.data?.message || 'Ошибка при получении данных');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setProtectedData('');
  };

  return (
    <div className="app-container">
      <h1>JWT Аутентификация</h1>
      <AuthForm
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        isRegister={isRegister}
        handleSubmit={handleSubmit}
      />
      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
      </button>
      {message && <p style={{ color: error ? 'red' : 'green' }}>{message}</p>}
      {token && (
        <div className="token">
          <h2>Токен:</h2>
          <code>{token}</code>
          <button onClick={getProtected}>Получить защищенные данные</button>
          <button onClick={handleLogout}>Выйти</button>
          {protectedData && <pre>{protectedData}</pre>}
        </div>
      )}
    </div>
  );
};

export default App;