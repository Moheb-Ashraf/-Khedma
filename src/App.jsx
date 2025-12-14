import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// استدعاء الصفحات
import AdminPanel from './pages/AdminPanel';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import MakhdoomProfile from './pages/MakhdoomProfile';

function App() {
  return (
    <BrowserRouter>
      {/* مكتبة التنبيهات عشان تظهر رسائل جميلة */}
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/makhdoom/:id" element={<MakhdoomProfile />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;