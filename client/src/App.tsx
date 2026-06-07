import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/mainLayout';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import UserProfile from './pages/Profile/UserProfile';

const TagsPlaceholder: React.FC = () => (
  <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
    Trang Danh sách Thẻ môn học
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route cha dùng chung Layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="tags" element={<TagsPlaceholder />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>
        {/* Route auth - trang trắng, không có layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;