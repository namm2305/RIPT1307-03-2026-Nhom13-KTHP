import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/mainLayout';
import Home from './pages/Home';
import QuestionDetail from './pages/QuestionDetail';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Định nghĩa Layout chung cho toàn bộ website */}
        <Route path="/" element={<MainLayout />}>
          
          {/* Trang chủ - Danh sách câu hỏi */}
          <Route index element={<Home />} />

          {/* TV3: Trang chi tiết câu hỏi */}
          <Route path="question/:id" element={<QuestionDetail />} />
          
          {/* Sau này các bạn khác chỉ cần thêm các Route con vào đây */}
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;