//board 컴포넌트 재사용해 출력하게한다
//내 포스트 / 좋아요한 포스트 / 북마크한 포스트

//내포스트
function MyPostList({ posts, title = '내 게시글', emptyMessage = '작성한 게시글이 없습니다.', onCancelLike }) {
  return (
    <section>
      <h2>{title}</h2>

      {posts.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.post_id}>
              <p>{post.title}</p>
              {onCancelLike && (
                <button type="button" onClick={() => onCancelLike(post.post_id)}>
                  좋아요 취소
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default MyPostList;

//
