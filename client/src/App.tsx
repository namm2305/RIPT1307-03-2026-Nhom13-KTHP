import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayouts';
import Home from './pages/Home';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';

const TagsPlaceholder: React.FC = () => {
  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
      Trang Danh sách thẻ môn học
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Route cha dùng chung Layout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="tags" element={<TagsPlaceholder />} />
            <Route path="login" element={<Login />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;