import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/mainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import AskQuestion from './pages/AskQuestion';
import Tags from './pages/Tags';
import TagDetail from './pages/TagDetail';
import NotFound from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Route cha dùng chung Layout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="tags" element={<Tags />} />
            <Route path="tags/:id" element={<TagDetail />} />
            <Route path="ask" element={<AskQuestion />} />
            <Route path="login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;