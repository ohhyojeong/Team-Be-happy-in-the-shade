//recipe 컴포넌트 재사용해 출력하게한다
function MyRecipeList({ recipes }) {
  return (
    <section>
      <h2>내 레시피</h2>

      {recipes.length === 0 ? (
        <p>작성한 레시피가 없습니다.</p>
      ) : (
        <ul>
          {recipes.map((recipe) => (
            <li key={recipe.recipe_id}>{recipe.recipe_title}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default MyRecipeList;