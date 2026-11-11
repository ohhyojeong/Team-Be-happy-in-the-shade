import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockRecipes, mockRecipeDetail } from '../mockData';
import RecipeForm from './RecipeForm';

function RecipeEditPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const recipe = mockRecipes.find((item) => Number(item.recipe_id) === Number(id));

  if (!isAuthenticated || !user) {
    return <p>로그인 후 레시피를 수정할 수 있습니다.</p>;
  }
  if (!recipe) return <p>레시피를 찾을 수 없습니다.</p>;
  if (Number(recipe.user_id) !== Number(user.user_id)) {
    return <p>본인이 작성한 레시피만 수정할 수 있습니다.</p>;
  }

  const detail = Number(mockRecipeDetail.recipe_id) === Number(recipe.recipe_id)
    ? mockRecipeDetail : {};
  const initialData = {
    ...detail,
    ...recipe,
    main_image_url: recipe.main_image_url ?? recipe.image_url ?? '',
    tool_ids: recipe.tool_ids ?? (recipe.tool_id ? [recipe.tool_id] : []),
  };

  const handleSave = () => {
    // TODO: DB 연결 후 레시피 수정
    window.alert('레시피 수정 기능은 DB 연결 후 제공될 예정입니다. 현재 변경 내용은 저장되지 않습니다.');
  };

  return <RecipeForm key={recipe.recipe_id} initialData={initialData} onSave={handleSave} />;
}

export default RecipeEditPage;
