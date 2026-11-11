import { useAuth } from '../contexts/AuthContext';
import RecipeForm from './RecipeForm';

function RecipeCreatePage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <p>로그인 후 레시피를 작성할 수 있습니다.</p>;
  }

  const handleSave = () => {
    if (!user) throw new Error('로그인 후 이용해 주세요.');
    // TODO: DB 연결 후 레시피 등록
    window.alert('레시피 등록 기능은 DB 연결 후 제공될 예정입니다. 현재 입력 내용은 저장되지 않습니다.');
  };

  return (
    <section>
      <RecipeForm onSave={handleSave} />
    </section>
  );
}

export default RecipeCreatePage;
