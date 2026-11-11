import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { mockUser } from '../mockData'; 
import { PASSWORD_MIN } from '../constants'; 

// 토큰, 비동기 요청
//const [loading, setLoading] = useState(false);



export default function ResetPasswordPage() {
  const navigate = useNavigate();

  // 현재 진행 단계
  const [step, setStep] = useState('verify');

  // 사용자 입력
  const [form, setForm] = useState({email: '', code: '', password: '', confirmPassword: ''});

  // 인증 결과
  const [sentEmail, setSentEmail] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  // 에러 및 처리 상태
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');


  // 입력값 변경
  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'email' ? { code: '' } : {}),
    }));

    setError('');
    setMessage('');

    if (field === 'email') {
      setSentEmail('');
      setVerifiedEmail('');
      setStep('verify');
    }
  };

  // 인증번호 발송
  const handleSendCode = () => {
    const email = form.email.trim();

    setError('');
    setMessage('');
    setSentEmail('');
    setVerifiedEmail('');

    // mock에 등록된 이메일인지 확인
    if (email !== mockUser.email) {
      setError('mock 등록된 이메일이 없습니다. 임시: user1@test.com');
      return;
    }

    setSentEmail(email);
    setForm((prev) => ({ ...prev, code: '' }));
    setMessage('테스트 인증번호는 123456입니다. 실제 메일은 발송되지 않습니다.');

    // 백엔드 연결 시: 이메일 발송 API로 교체
  };

  // 인증번호 확인
  const handleVerifyCode = () => {
    setError('');
    setMessage('');

    if (!sentEmail || sentEmail !== form.email.trim()) {
      setError('인증번호를 먼저 요청해주세요.');
      return;
    }

    if (form.code.trim() !== '123456') {
      setError('인증번호가 일치하지 않습니다.');
      return;
    }

    setVerifiedEmail(sentEmail);
    setStep('reset');

    // 백엔드 연결 시: 인증번호 검증 API로 교체
  };

  // 비밀번호 변경
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!verifiedEmail || verifiedEmail !== form.email.trim()) {
      setError('이메일 인증이 필요합니다.');
      return;
    }

    if (form.password.length < PASSWORD_MIN) {
      setError(`비밀번호는 ${PASSWORD_MIN}자 이상 입력해주세요.`);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    console.log('비밀번호 변경 입력 검증 완료', {
      user_id: mockUser.user_id,
      email: verifiedEmail,
    });

    // 백엔드 연결 시: 비밀번호 변경 API 호출
    alert('테스트 완료 아직 실제 비밀번호는 변경되지 않습니다.');
    navigate('/login');
  };

  return (
    <div>
      <h2>비밀번호 찾기</h2>

      {step === 'verify' ? (
        <div>
          <p>가입한 이메일을 인증해주세요.</p>

          <input type="email" placeholder="이메일" value={form.email} onChange={(e) => update('email', e.target.value)}/>

          <button type="button" onClick={handleSendCode}>
            인증번호 받기
          </button>

          <div>
            <input placeholder="인증번호" value={form.code} onChange={(e) => update('code', e.target.value)}/>

            <button type="button" onClick={handleVerifyCode}>
              인증 확인
            </button>
          </div>
        </div>

      ) : (

        <form onSubmit={handleSubmit}>
          <p>새 비밀번호를 설정해주세요.</p>

          <input type="password" placeholder="새 비밀번호" value={form.password} onChange={(e) => update('password', e.target.value)}/>

          <input type="password" placeholder="새 비밀번호 확인" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)}/>

          <button type="submit">
            비밀번호 변경
          </button>
        </form>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p>{message}</p>}

      <Link to="/login">로그인으로 돌아가기</Link>
    </div>
  );
}