import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/mainLayout'; // Đã khớp chữ m viết thường theo file của bạn
import Home from './pages/Home';

const LoginPlaceholder = () => <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>Trang Đăng nhập (Thành viên khác làm)</div>;
const TagsPlaceholder = () => <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>Trang Danh sách Thẻ môn học</div>;

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route cha dùng chung Layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="tags" element={<TagsPlaceholder />} />
          <Route path="login" element={<LoginPlaceholder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;