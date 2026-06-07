import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/mainLayout';
import Home from './pages/Home';
import QuestionDetail from './pages/QuestionDetail';
import Tags from './pages/Tags';
import TagDetail from './pages/TagDetail';
import AskQuestion from './pages/AskQuestion';
import NotFound from './pages/NotFound';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import UserProfile from './pages/Profile/UserProfile';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Route cha dùng chung Layout */}
          <Route path="/" element={<MainLayout />}>
            {/* Trang chủ */}
            <Route index element={<Home />} />

            {/* TV3 - Nam: Trang chi tiết câu hỏi */}
            <Route path="question/:id" element={<QuestionDetail />} />

            {/* TV2 - Đăng: Thẻ môn học */}
            <Route path="tags" element={<Tags />} />
            <Route path="tags/:id" element={<TagDetail />} />

            {/* TV2 - Đăng: Đặt câu hỏi */}
            <Route path="ask" element={<AskQuestion />} />

            {/* TV4 - Đuung: Trang cá nhân */}
            <Route path="profile" element={<UserProfile />} />

            {/* Trang 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* TV4 - Đuung: Route auth - trang riêng, không có layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;