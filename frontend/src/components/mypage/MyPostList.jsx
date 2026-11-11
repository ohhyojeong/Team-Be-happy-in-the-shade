//board 컴포넌트 재사용해 출력하게한다
//내 포스트 / 좋아요한 포스트 / 북마크한 포스트

//내포스트
function MyPostList({ posts }) {
  return (
    <section>
      <h2>내 게시글</h2>

      {posts.length === 0 ? (
        <p>작성한 게시글이 없습니다.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.post_id}>{post.title}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default MyPostList;

//