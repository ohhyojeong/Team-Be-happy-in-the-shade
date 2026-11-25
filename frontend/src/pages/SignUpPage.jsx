// 담당: 오효정 (임시화면입니다~)
// [디자인 11/22 조현기] 시안 F 적용 — className(모양)만 바꿈, 중복 확인 · 이메일 인증 · 가입 로직은 그대로
//   1. signup-layout · panel · auth-heading · form-field · btn 등은 정의된 CSS가 없어서 적용이 안 되고 있었음 → Tailwind 클래스로 바꿈
//   2. 가운데 흰 카드(최대 520px), 입력칸 옆 확인 버튼은 회색 알약, 가입 버튼은 포인트색
//   3. 안내 · 오류 문구: 성공은 초록, 오류는 빨간 상자
// [병합 수정 11/24 조현기] MOCK_EMAIL_CODE가 지워진 채 쓰여서 [인증 확인]이 오류 → 가입이 막히던 문제
//   이메일 인증을 실제 API로 연결 (비밀번호 찾기와 같은 email_auth: POST /auth/send-code · /auth/verify-code)

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';   // [수정 11/24 조현기] useLocation: 돌아갈 주소(from)를 로그인 화면에 넘김
import { useAuth } from '../contexts/AuthContext';
import { NICKNAME_MIN, PASSWORD_MIN } from '../constants';
import api from '../api';


const INITIAL_FORM = { login_id: '', nickname: '', email: '', password: '', confirmPassword: '' };

export default function SignUpPage() {
  const navigate = useNavigate();
  // [수정 11/24 조현기] 로그인 화면에서 넘겨받은 '로그인 후 돌아갈 주소' → 가입 후 로그인 화면에 그대로 넘김
  const location = useLocation();
  const from = location.state?.from;
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

    // 아이디 중복 확인
  const checkId = async () => {
    const id = form.login_id.trim();

    if (!/^[a-zA-Z0-9]{4,20}$/.test(id)) {
      setCheckedId('');
      setIdMessage('아이디는 영문·숫자 4~20자로 입력하세요.');
      return;
    }

    try {
      const { data } = await api.get('/users/check-login-id', {
        params: { login_id: id },
      });

      if (!data.available) {
        setCheckedId('');
        setIdMessage('이미 사용 중인 아이디입니다.');
        return;
      }

      setCheckedId(id);
      setIdMessage('사용 가능한 아이디입니다.');
    } catch {
      setCheckedId('');
      setIdMessage('아이디 중복 확인에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  // 서버가 준 오류 문장 꺼내기
  const errorText = (err, fallback) => {
    const detail = err.response?.data?.detail;
    return typeof detail === 'string' ? detail : fallback;
  };

  // 이메일 인증번호 요청 (POST /auth/send-code) — 메일 계정이 없으면 백엔드 터미널에 번호가 찍힘
  const sendEmailCode = async () => {
    const email = form.email.trim();

    // 아이디 중복 확인 추가 
    if (!checkedId || checkedId !== form.login_id.trim()) {
      setEmailMessage('아이디 중복 확인을 먼저 진행해 주세요.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailMessage('올바른 이메일을 입력하세요.');
      return;
    }

    try {
      const { data } = await api.post('/auth/send-code', { email });
      setSentEmail(email);
      setVerifiedEmail('');
      setVerificationCode('');
      setEmailMessage(data.message ?? '인증번호를 보냈습니다.');
    } catch (err) {
      setSentEmail('');
      setEmailMessage(errorText(err, '인증번호를 보내지 못했습니다. 다시 시도해 주세요.'));
    }
  };

  // 이메일 인증번호 확인 (POST /auth/verify-code)
  const verifyEmailCode = async () => {
    if (!sentEmail || sentEmail !== form.email.trim()) {
      setEmailMessage('먼저 인증번호를 요청하세요.');
      return;
    }

    try {
      await api.post('/auth/verify-code', { email: sentEmail, code: verificationCode });
      setVerifiedEmail(sentEmail);
      setEmailMessage('이메일 인증이 완료되었습니다.');
    } catch (err) {
      setEmailMessage(errorText(err, '인증번호 확인에 실패했습니다. 다시 시도해 주세요.'));
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setError('');

    // SignUpPage: 현재 아이디의 중복 확인 여부와 현재 이메일의 인증 여부를 검사
    // 현재 입력한 아이디로 중복 확인했는지 검사
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
      // AuthContext.signup(): 아이디 형식, 이메일, 닉네임·비밀번호 최소 길이, 비밀번호 일치 검사
      // 현재는 입력 검사 통과 시 true를 반환하며, 실제 가입 없이 로그인 화면으로 이동
      const success = await signup({
        login_id: form.login_id.trim(),
        email: form.email.trim(),
        nickname: form.nickname.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      if (success) {
        navigate('/login', { replace: true, state: { from } });   // [수정 11/24 조현기] from: 로그인하면 원래 화면으로
      }
    } catch (err) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = "flex flex-col gap-2";
  const labelClass = "text-sm font-bold";
  const rowClass = "flex gap-2";
  const sideButton = "h-12 flex-none rounded-pill bg-gray-100 px-4 text-sm font-bold hover:bg-gray-200 disabled:opacity-40";
  // 메시지가 '완료' · '가능'이면 초록, 아니면 흐린 글씨
  const messageClass = (message) =>
    // 인증번호를 보냈습니다도 추가할 수 있게 변경
    `text-sm ${/완료|사용 가능|보냈습니다/.test(message) ? "text-have font-bold" : "text-muted"}`; 

  return (
    <div className="mx-auto mt-4 max-w-[520px] rounded-card bg-surface p-8 shadow-card md:p-10">
      <div>
        <h1 className="text-3xl font-black">회원가입</h1>
        <p className="mt-2 text-muted">함께 맛있는 레시피를 나눠 보세요.</p>
      </div>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
      {/* 아이디 중목확인 */}
      <div className={fieldClass}>
        <label htmlFor="signup-id" className={labelClass}>아이디</label>

        <div className={rowClass}>
          <input id="signup-id" autoComplete="username" placeholder="영문·숫자 4~20자"
            className="h-12 min-w-0 flex-1"
            pattern="[a-zA-Z0-9]{4,20}" minLength={4} maxLength={20} value={form.login_id}
            onChange={(e) => update('login_id', e.target.value)}
            required
          />

          <button type="button" onClick={checkId} className={sideButton}>
            중복 확인
          </button>
        </div>
          {idMessage && <p role="status" className={messageClass(idMessage)}>{idMessage}</p>}
      </div>

        {/* 이메일 , 인증번호 요청 버튼 */}
        <div className={fieldClass}>
        
          
          <label htmlFor="signup-email" className={labelClass}>이메일</label>

          <div className={rowClass}>
            <input id="signup-email" type="email" autoComplete="email" placeholder="example@email.com"
              className="h-12 min-w-0 flex-1"
              value={form.email} onChange={(e) => update('email', e.target.value)} required
            />

            <button type="button" onClick={sendEmailCode} className={sideButton}>
              인증번호 받기
            </button>
            
          </div>
            {emailMessage && (
          <p role="status" className={messageClass(emailMessage)}>
            {emailMessage}
          </p>
          )}   
        </div>

        {/* 이메일 인증번호 입력 */}
        <div className={fieldClass}>
          <label htmlFor="signup-code" className={labelClass}>이메일 인증번호</label>

          <div className={rowClass}>
            <input id="signup-code" type="text" inputMode="numeric" autoComplete="one-time-code"
              className="h-12 min-w-0 flex-1 disabled:bg-gray-50"
              placeholder="인증번호 6자리" maxLength={6} value={verificationCode}
              disabled={!sentEmail || !!verifiedEmail}
              onChange={(e) => {
                setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              }}
            />

            <button type="button" onClick={verifyEmailCode} className={sideButton}
              disabled={!sentEmail || verificationCode.length !== 6 || !!verifiedEmail}>
              인증 확인
            </button>
          </div>
        </div>

        <div className={fieldClass}>
          <label htmlFor="signup-nickname" className={labelClass}>닉네임</label>
          <input id="signup-nickname" type="text" autoComplete="nickname" className="h-12"
            placeholder={`최소 ${NICKNAME_MIN}글자`} minLength={NICKNAME_MIN} value={form.nickname}
            onChange={(event) => update('nickname', event.target.value)}
            required
          />
        </div>

        <div className={fieldClass}>
          <label htmlFor="signup-password" className={labelClass}>비밀번호</label>
          <input id="signup-password" type="password" autoComplete="new-password" className="h-12"
            placeholder={`최소 ${PASSWORD_MIN}자리`} minLength={PASSWORD_MIN} value={form.password}
            onChange={(event) => update('password', event.target.value)}
            required
          />
        </div>

        <div className={fieldClass}>
          <label htmlFor="signup-confirm" className={labelClass}>비밀번호 확인</label>
          <input id="signup-confirm" type="password" autoComplete="new-password" className="h-12"
            value={form.confirmPassword}
            onChange={(event) => update('confirmPassword', event.target.value)}
            required
          />
        </div>

        {error && (
          <p className="rounded-[16px] bg-miss-soft px-4 py-3 text-sm text-miss" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="mt-2 h-12 rounded-pill bg-accent font-bold text-white hover:bg-accent-dark disabled:opacity-40" disabled={submitting}>
          {submitting ? '가입 중...' : '회원가입'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        이미 계정이 있으신가요? <Link to="/login" state={{ from }} className="font-bold text-accent">로그인</Link>
      </p>
    </div>
  );
}
