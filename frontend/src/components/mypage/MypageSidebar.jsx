// 좋아요한 요리, 북마크한 요리, 내 레시피 , 내 댓글, 로그아웃

function MypageSidebar({ activeMenu, onMenuChange, onLogout }) {
  return (
    <nav className="mypage-sidebar">

      <button
        type="button"
        onClick={() => onMenuChange('profile')}
        disabled={activeMenu === 'profile'}>
        프로필 수정
      </button>

      <button
        type="button"
        onClick={() => onMenuChange('liked')}
        disabled={activeMenu === 'liked'}>
        좋아요한 요리
      </button>

      <button
        type="button"
        onClick={() => onMenuChange('bookmarked')}
        disabled={activeMenu === 'bookmarked'}>
        북마크한 요리
      </button>

      <button
        type="button"
        onClick={() => onMenuChange('recipes')}
        disabled={activeMenu === 'recipes'}>
        내 레시피
      </button>

      <button
        type="button"
        onClick={() => onMenuChange('posts')}
        disabled={activeMenu === 'posts'}>
        내 게시글
      </button>

      <button
        type="button"
        onClick={() => onMenuChange('comments')}
        disabled={activeMenu === 'comments'}>
        내 댓글
      </button>

      <hr />

      <button
        type="button"
        onClick={onLogout}>
        로그아웃
      </button>

    </nav>
  );
}

export default MypageSidebar;
