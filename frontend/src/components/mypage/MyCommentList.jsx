//Mypage.jsx에서 전달받은 comments를 화면에 랜더링한다
// type: 게시글 or type : 레시피
function MyCommentList({ comments }) {
  return (
    <section>
      <h2>내 댓글</h2>

      {comments.length === 0 ? (
        <p>작성한 댓글이 없습니다.</p>
      ) : (
        <ul>{comments.map((comment) => (
            <li key={comment.id}>[{comment.type}] {comment.content}</li>))}
        </ul>
      )}
    </section>
  );
}

export default MyCommentList;