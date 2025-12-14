import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

// الصفحات
import AdminPanel from './pages/AdminPanel';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import MakhdoomProfile from './pages/MakhdoomProfile';

// --- 1. مكون الحماية (الحارس) ---
// ده بنحوط بيه الصفحات اللي مش عاوزين حد يدخلها من غير تسجيل
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // لو مفيش توكن، رجعه لصفحة اللوجين
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // لو فيه توكن، اعرض الصفحة المطلوبة
  return children;
};

// --- 2. مكون منع الدخول للمسجلين ---
// ده عشان لو هو مسجل دخول وحاول يفتح صفحة اللوجين، يوديه الداشبورد علطول
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      
      <Routes>
        {/* صفحة اللوجين (محمية إن المسجل ميروحش ليها تاني) */}
        <Route path="/" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        {/* باقي الصفحات (محمية إن محدش يدخلها غير المسجل) */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        <Route path="/makhdoom/:id" element={
          <PrivateRoute>
            <MakhdoomProfile />
          </PrivateRoute>
        } />
        
        <Route path="/admin" element={
          <PrivateRoute>
            <AdminPanel />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;