// 담당: 오효정 (임시화면입니다~)

//recipe 컴포넌트 재사용해 출력하게한다
import { Link } from 'react-router-dom';

function MyRecipeList({
  recipes,
  title = '내 레시피',
  emptyMessage = '작성한 레시피가 없습니다.',
  editable = false,
  onDelete,
  onCancel,
  cancelLabel,
}) {
  return (
    <section className="mypage-recipes">
      <h2>{title} {recipes.length}</h2>

      {recipes.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        <ul>
          {recipes.map((recipe) => (
            <li key={recipe.recipe_id}>
              <Link to={`/recipes/${recipe.recipe_id}`}>
                <img
                  src={recipe.main_image_url ?? recipe.image_url}
                  alt={recipe.recipe_title}
                  width="100"
                />
                <span>{recipe.recipe_title}</span>
              </Link>

              <p>
                {recipe.created_at?.slice(0, 10)}
                {' · '}좋아요 {recipe.like_count ?? 0}
                {' · '}댓글 {recipe.comment_count ?? 0}
              </p>

              {onCancel && (
                <button type="button" onClick={() => onCancel(recipe.recipe_id)}>
                  {cancelLabel}
                </button>
              )}

              {editable && (
                <>
                  <Link to={`/recipes/${recipe.recipe_id}/edit`}>
                    수정
                  </Link>

                  <button
                    type="button"
                    onClick={() => onDelete?.(recipe.recipe_id)}
                  >
                    삭제
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default MyRecipeList;
