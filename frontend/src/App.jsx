// 담당: 조현기
// 라우터 설정 + 모든 페이지에 공통으로 들어가는 레이아웃
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import MyPage from "./pages/MyPage";
import FridgePage from "./pages/FridgePage";
import RecipeListPage from "./pages/RecipeListPage";
import RecipeRecommendPage from "./pages/RecipeRecommendPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import RecipeCreatePage from "./pages/RecipeCreatePage";
import RecipeEditPage from "./pages/RecipeEditPage";
import BoardListPage from "./pages/BoardListPage";
import BoardDetailPage from "./pages/BoardDetailPage";
import BoardFormPage from "./pages/BoardFormPage";
import NotFoundPage from "./pages/NotFoundPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";// resetpasswordpage추가

// 1. 공통 레이아웃
// AuthProvider 안에서 useNavigate를 쓰기 때문에 라우터 안쪽(여기)에서 감싼다. (mini와 같음)
const RootLayout = () => {
  return (
    <AuthProvider>
      <NavBar />
      <main>
        <Outlet /> {/* 페이지 내용이 바뀔 자리 */}
      </main>
    </AuthProvider>
  );
};

// 2. 라우터 설정 (경로는 컴포넌트 정리 문서 기준)
// /recipes/recommend, /recipes/new 는 /recipes/:id 보다 위에 둔다.
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignUpPage /> },
      { path: "password-reset", element: <ResetPasswordPage /> }, // resetpasswordpage추가
      { path: "mypage", element: <ProtectedRoute><MyPage /></ProtectedRoute> },
      { path: "fridge", element: <ProtectedRoute><FridgePage /></ProtectedRoute> },

      { path: "recipes", element: <RecipeListPage /> },
      { path: "recipes/recommend", element: <RecipeRecommendPage /> },
      { path: "recipes/new", element: <ProtectedRoute><RecipeCreatePage /></ProtectedRoute> },
      { path: "recipes/:id", element: <RecipeDetailPage /> },
      { path: "recipes/:id/edit", element: <ProtectedRoute><RecipeEditPage /></ProtectedRoute> },

      { path: "board", element: <BoardListPage /> },
      { path: "board/new", element: <ProtectedRoute><BoardFormPage /></ProtectedRoute> },
      { path: "board/:id", element: <BoardDetailPage /> },
      { path: "board/:id/edit", element: <ProtectedRoute><BoardFormPage /></ProtectedRoute> },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

// 3. App에서는 RouterProvider만 리턴
const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
