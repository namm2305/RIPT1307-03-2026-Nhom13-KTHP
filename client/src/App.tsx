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
import AdminDashboard from './pages/Admin/AdminDashboard';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />

            <Route path="question/:id" element={<QuestionDetail />} />

            <Route path="tags" element={<Tags />} />
            <Route path="tags/:id" element={<TagDetail />} />

            <Route path="ask" element={<AskQuestion />} />

            <Route path="profile" element={<UserProfile />} />
            <Route path="user/:id" element={<UserProfile />} />

            <Route path="admin" element={<AdminDashboard />} />

            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;