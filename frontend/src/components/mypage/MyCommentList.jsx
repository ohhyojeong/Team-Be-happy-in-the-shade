import { useState } from 'react';
import { Link } from 'react-router-dom';

// 목록 조회는 mock으로 표시하고, 변경 작업은 DB 연결 후 구현합니다.
function MyCommentList({ comments }) {
  const [activeTab, setActiveTab] = useState('recipe');
  const visibleComments = comments
    .filter((comment) => comment.targetType === activeTab)
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));

  const notifyPending = (action) => {
    // TODO: API 연결 후 본인 댓글 권한 확인 및 성공 시 목록 갱신
    window.alert(`댓글 ${action} 기능은 DB 연결 후 제공될 예정입니다.`);
  };

  return (
    <section className="mypage-comments">
      <h2>내 댓글</h2>

      <div aria-label="댓글 종류">
        <button type="button" aria-pressed={activeTab === 'recipe'} onClick={() => setActiveTab('recipe')}>
          레시피 댓글 {comments.filter((comment) => comment.targetType === 'recipe').length}
        </button>
        <button type="button" aria-pressed={activeTab === 'post'} onClick={() => setActiveTab('post')}>
          커뮤니티 댓글 {comments.filter((comment) => comment.targetType === 'post').length}
        </button>
      </div>

      {visibleComments.length === 0 ? (
        <p>작성한 {activeTab === 'recipe' ? '레시피' : '커뮤니티'} 댓글이 없습니다.</p>
      ) : (
        <ul>
          {visibleComments.map((comment) => (
            <li key={comment.id}>
              <strong>{comment.targetTitle ?? (comment.targetType === 'recipe' ? '삭제된 레시피' : '삭제된 게시글')}</strong>
              <p>{comment.content}</p>
              {comment.createdAt && (
                <time dateTime={comment.createdAt}>{comment.createdAt.slice(0, 10)}</time>
              )}
              {comment.targetTitle != null ? (
                <>
                  <Link to={`/${comment.targetType === 'recipe' ? 'recipes' : 'board'}/${comment.targetId}`}>
                    원문 보기
                  </Link>
                  <button type="button" onClick={() => notifyPending('수정')}>수정</button>
                  <button type="button" onClick={() => notifyPending('삭제')}>삭제</button>
                </>
              ) : (
                <p>원문을 확인할 수 없습니다.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default MyCommentList;
