import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const toastId = toast.loading("جاري تسجيل الدخول...");
        try {
            const res = await api.post('/login', { email, password });
            
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('servantName', res.data.name);
            localStorage.setItem('role', res.data.role);

            toast.success(`أهلاً بيك يا ${res.data.name}`, { id: toastId });
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data || "بيانات الدخول غير صحيحة", { id: toastId });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <form 
                onSubmit={handleLogin} 
                className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md border-t-4 border-blue-600"
            >
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-800">
                    تسجيل دخول الخدام ✝️
                </h2>
                
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">الإيميل</label>
                    <input 
                        type="email" required
                        className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">كلمة المرور</label>
                    <input 
                        type="password" required
                        className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-blue-600 text-white p-2 sm:p-3 rounded hover:bg-blue-700 transition font-bold"
                >
                    دخول
                </button>
            </form>
        </div>
    );
}
