import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Định nghĩa Layout chung cho toàn bộ website */}
        <Route path="/" element={<MainLayout />}>
          
          {/* Hiện tại bên trong đang rỗng, chưa có trang nào */}
          <Route index element={<div>Trang chủ đang được phát triển...</div>} />
          
          {/* Sau này các bạn khác chỉ cần thêm các Route con vào đây */}
          {/* Ví dụ: <Route path="profile" element={<Profile />} /> */}
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;