import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (event) => {
    event.preventDefault();

    const success = await login(email, password);

    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="auth-card panel">
      <h1>로그인</h1>

      <form onSubmit={submit}>
        <div className="form-field">
          <label htmlFor="login-email">이메일</label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="login-password">비밀번호</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit">로그인</button>
      </form>

      <Link to="/signup">회원가입</Link>
      <Link to="/password-reset">비밀번호 찾기</Link>
    </div>
  );
}
