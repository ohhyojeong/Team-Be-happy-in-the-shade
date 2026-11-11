import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { IMAGE_MAX_MB, IMAGE_TYPES, NICKNAME_MAX, NICKNAME_MIN } from '../../constants';

function ProfileEditor({ user }) {
  const { updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    nickname: user?.nickname ?? '',
    profile_image_url: user?.profile_image_url ?? null,
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isReading, setIsReading] = useState(false);
  const fileInputRef = useRef(null);
  const readerRef = useRef(null);

  useEffect(() => () => readerRef.current?.abort(), []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setMessage('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    readerRef.current?.abort();
    setIsReading(false);
    setMessage('');
    if (!IMAGE_TYPES.includes(file.type)) {
      setError('JPG, PNG, WEBP 사진만 선택할 수 있습니다.');
      return;
    }
    if (file.size > IMAGE_MAX_MB * 1024 * 1024) {
      setError(`사진은 ${IMAGE_MAX_MB}MB 이하로 선택해 주세요.`);
      return;
    }

    // mock에서는 사진을 메모리에 보관한다. 실제 업로드 시 원본 파일을 전송한다.
    const reader = new FileReader();
    readerRef.current = reader;
    setError('');
    setIsReading(true);
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, profile_image_url: reader.result }));
      setIsReading(false);
    };
    reader.onerror = () => {
      setError('사진을 읽지 못했습니다. 다시 선택해 주세요.');
      setIsReading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleImageDelete = () => {
    readerRef.current?.abort();
    setIsReading(false);
    setFormData((prev) => ({ ...prev, profile_image_url: null }));
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReading || !user) return;
    const nickname = formData.nickname.trim();
    if (nickname.length < NICKNAME_MIN || nickname.length > NICKNAME_MAX) {
      setError(`닉네임은 ${NICKNAME_MIN}~${NICKNAME_MAX}글자로 입력해 주세요.`);
      return;
    }

    setError('');
    setMessage('');
    try {
      const { data: profile } = await axios.patch('/auth/me', {
        ...formData,
        nickname,
      }, { withCredentials: true });
      updateProfile(profile);
      setFormData({
        nickname: profile.nickname,
        profile_image_url: profile.profile_image_url ?? null,
      });
      setMessage('프로필을 변경했습니다.');
    } catch {
      setError('프로필을 저장하지 못했습니다. 다시 시도해 주세요.');
    }
  };

  const handleCancel = () => {
    readerRef.current?.abort();
    setIsReading(false);
    setFormData({
      nickname: user.nickname,
      profile_image_url: user.profile_image_url ?? null,
    });
    setError('');
    setMessage('');
  };

  if (!user) {
    return <p>로그인 후 이용해 주세요.</p>;
  }

  return (
    <section>
      <h2>프로필 수정</h2>
      <form onSubmit={handleSubmit}>
        <div>
          {formData.profile_image_url ? (
            <img src={formData.profile_image_url} alt="프로필 미리보기"
              width={120} height={120} className="rounded-full object-cover" />
          ) : <p>프로필 사진이 없습니다.</p>}
          <input ref={fileInputRef} type="file" accept={IMAGE_TYPES.join(',')}
            aria-label="프로필 사진 선택" onChange={handleImageChange} hidden />
          <button type="button" onClick={() => fileInputRef.current.click()}>사진 변경</button>
          <button type="button" onClick={handleImageDelete}
            disabled={!formData.profile_image_url && !isReading}>사진 삭제</button>
          {isReading && <p role="status">사진을 불러오는 중입니다.</p>}
        </div>

        <div>
          <strong>이메일</strong>
          <p>{user.email}</p>
        </div>

        <label htmlFor="profile-nickname">닉네임</label>
        <input id="profile-nickname" name="nickname" value={formData.nickname}
          maxLength={NICKNAME_MAX} onChange={handleChange} required />
        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        <div>
          <button type="submit" disabled={isReading}>변경하기</button>
          <button type="button" onClick={handleCancel}>취소</button>
        </div>
      </form>
    </section>
  );
}

export default ProfileEditor;
