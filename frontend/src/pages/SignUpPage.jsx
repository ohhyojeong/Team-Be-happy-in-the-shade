import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NICKNAME_MIN, PASSWORD_MIN } from '../constants';
import { mockUser } from '../mockData';

// 추가: 백엔드 연결 시 아이디 중복 조회 API로 교체
// 현재 mockUser에 login_id가 없으면 demo1234를 테스트 아이디로 사용
const MOCK_LOGIN_IDS = [mockUser.login_id ?? 'demo1234'];

// 추가: 백엔드 연결 시 실제 이메일 발송·인증 API로 교체
const MOCK_EMAIL_CODE = '123456';

const INITIAL_FORM = { login_id: '', nickname: '', email: '', password: '', confirmPassword: '' };


export default function SignUpPage() {
  const navigate = useNavigate();
  const { signup, error, setError } = useAuth();


  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [checkedId, setCheckedId] = useState(''); // 중복 확인한 아이디
  const [idMessage, setIdMessage] = useState(''); // 아이디 확인 메시지
  const [sentEmail, setSentEmail] = useState(''); // 인증번호 요청한 이메일
  const [verificationCode, setVerificationCode] = useState(''); // 
  const [verifiedEmail, setVerifiedEmail] = useState(''); // 
  const [emailMessage, setEmailMessage] = useState(''); // 


  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');

    //아이디가 바뀌면 중복 확인을 다시 해야 함
    if (field === 'login_id') {
      setCheckedId('');
      setIdMessage('');
    }

    //이메일이 바뀌면 인증을 다시 해야 함
    if (field === 'email') {
      setSentEmail('');
      setVerificationCode('');
      setVerifiedEmail('');
      setEmailMessage('');
    }
  };

  //아이디 중복 확인
  const checkId = () => {
    const id = form.login_id.trim();

    if (!/^[a-zA-Z0-9]{4,20}$/.test(id)) {
      setCheckedId('');
      setIdMessage('아이디는 영문·숫자 4~20자로 입력하세요.');
      return;
    }

    // 백엔드 연결 시: 중복 확인 API 호출로 변경
    const exists = MOCK_LOGIN_IDS.some(
      (savedId) => savedId.toLowerCase() === id.toLowerCase()
    );

    if (exists) {
      setCheckedId('');
      setIdMessage('이미 사용 중인 아이디입니다.');
      return;
    }

      setCheckedId(id);
      setIdMessage('사용 가능한 아이디입니다.');
    };

  // 이메일 인증번호 요청 mock
  const sendEmailCode = () => {
    const email = form.email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailMessage('올바른 이메일을 입력하세요.');
      return;
    }

    // 백엔드 연결 시: 실제 이메일 발송 API 호출
    setSentEmail(email);
    setVerifiedEmail('');
    setVerificationCode('');
    setEmailMessage('테스트 인증번호는 123456입니다. 실제 메일은 발송되지 않습니다.');
  };

  // 이메일 인증번호 확인 mock
  const verifyEmailCode = () => {
    if (!sentEmail || sentEmail !== form.email.trim()) {
      setEmailMessage('먼저 인증번호를 요청하세요.');
      return;
    }

    // 백엔드 연결 시: 인증번호 확인 API 호출
    if (verificationCode !== MOCK_EMAIL_CODE) {
      setEmailMessage('인증번호가 일치하지 않습니다.');
      return;
    }

    setVerifiedEmail(sentEmail);
    setEmailMessage('이메일 인증이 완료되었습니다.');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setError('');

    //  현재 입력한 아이디로 중복 확인했는지 검사
    if (!checkedId || checkedId !== form.login_id.trim()) {
      setError('아이디 중복 확인을 해주세요.');
      return;
    }

    // 현재 입력한 이메일로 인증했는지 검사
    if (!verifiedEmail || verifiedEmail !== form.email.trim()) {
      setError('이메일 인증을 완료해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const success = await signup({
        login_id: form.login_id.trim(), // 추가: Context에서도 추후 처리 필요
        email: form.email.trim(),
        nickname: form.nickname.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      if (success) {
        navigate('/login', { replace: true });
      }
    } catch (err) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="signup-layout panel">
      <div className="auth-heading">
        <h1>회원가입</h1>
        <p>함께 맛있는 레시피를 나눠 보세요.</p>
      </div>

      <form onSubmit={submit}>
      {/* 아이디 중목확인 */}
      <div className="form-field">
        <label htmlFor="signup-id">아이디</label>

        <div>
          <input
            id="signup-id"
            autoComplete="username"
            placeholder="영문·숫자 4~20자"
            pattern="[a-zA-Z0-9]{4,20}"
            minLength={4}
            maxLength={20}
            value={form.login_id}
            onChange={(e) => update('login_id', e.target.value)}
            required
          />

          <button type="button" onClick={checkId}>
            중복 확인
          </button>
        </div>
          {idMessage && <p role="status">{idMessage}</p>}
      </div>

        {/* 이메일 , 인증번호 요청 버튼 */}
        <div className="form-field">
          <label htmlFor="signup-email">이메일</label>

          <div>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
            />

            <button type="button" onClick={sendEmailCode}>
              인증번호 받기
            </button>
          </div>
        </div>

        {/* 이메일 인증번호 입력 */}
        <div className="form-field">
          <label htmlFor="signup-code">이메일 인증번호</label>

          <div>
            <input
              id="signup-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="인증번호 6자리"
              maxLength={6}
              value={verificationCode}
              disabled={!sentEmail || !!verifiedEmail}
              onChange={(e) => {
                setVerificationCode(
                  e.target.value.replace(/\D/g, '').slice(0, 6));}}/>

            <button type="button" onClick={verifyEmailCode}
              disabled={ !sentEmail ||verificationCode.length !== 6 || !!verifiedEmail}>
              인증 확인
            </button>
          </div>
          {emailMessage && <p role="status">{emailMessage}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="signup-nickname">닉네임</label>
          <input
            id="signup-nickname"
            type="text"
            autoComplete="nickname"
            placeholder={`최소 ${NICKNAME_MIN}글자`}
            minLength={NICKNAME_MIN}
            value={form.nickname}
            onChange={(event) => update('nickname', event.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="signup-password">비밀번호</label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            placeholder={`최소 ${PASSWORD_MIN}자리`}
            minLength={PASSWORD_MIN}
            value={form.password}
            onChange={(event) => update('password', event.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="signup-confirm">비밀번호 확인</label>
          <input
            id="signup-confirm"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(event) =>
              update('confirmPassword', event.target.value)
            }
            required
          />
        </div>

        {error && (
          <p className="alert-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={submitting}
        >
          {submitting ? '가입 중...' : '회원가입'}
        </button>
      </form>

      <p className="auth-bottom">
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </div>
  );
}
