import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
    const [makhdumeen, setMakhdumeen] = useState([]);
    const [newName, setNewName] = useState('');
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchMakhdumeen();
    }, []);

    const fetchMakhdumeen = async () => {
        try {
            const res = await api.get('/all-makhdoomen');
            setMakhdumeen(res.data);
        } catch (err) {
            if(err.response?.status === 401) {
                toast.error("الجلسة انتهت، سجل دخول تاني");
                navigate('/');
            }
        }
    };

    const handleAddMakhdoom = async (e) => {
        e.preventDefault();
        if (!newName) return;
        try {
            await api.post('/create-makhdoom', { name: newName });
            toast.success("تم إضافة المخدوم");
            setNewName('');
            fetchMakhdumeen();
        } catch (err) {
            toast.error("حدث خطأ");
        }
    };

    const isAdmin = localStorage.getItem('role') === 'admin';

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
            <div className="max-w-full md:max-w-5xl mx-auto">
                {/* العنوان وزر تسجيل الخروج */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3 sm:gap-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">قائمة المخدومين</h1>
                    <button onClick={() => { localStorage.clear(); navigate('/'); }} 
                        className="text-red-500 hover:underline text-sm sm:text-base"
                    >
                        تسجيل خروج
                    </button>
                </div>

                {/* الشريط العلوي: إضافة + بحث + لوحة الأدمن */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {/* فورم الإضافة */}
                    <form onSubmit={handleAddMakhdoom} className="flex flex-col sm:flex-row gap-2 bg-white p-3 rounded shadow flex-1">
                        <input 
                            type="text" placeholder="اسم مخدوم جديد..." required
                            className="flex-1 p-2 border border-gray-200 rounded outline-none"
                            value={newName} onChange={(e) => setNewName(e.target.value)}
                        />
                        <button className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 mt-2 sm:mt-0">
                            إضافة
                        </button>
                    </form>

                    {/* مربع البحث */}
                    <div className="flex-1 flex items-center bg-white p-3 rounded shadow border border-gray-200">
                        <span className="text-gray-400 px-2">🔍</span>
                        <input 
                            type="text" placeholder="بحث بالاسم..." 
                            className="flex-1 p-2 border-none outline-none"
                            value={search} onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* زر الأدمن */}
                    {isAdmin && (
                        <Link to="/admin" className="bg-purple-600 text-white px-6 py-3 rounded shadow font-bold hover:bg-purple-700 text-center flex items-center justify-center mt-2 md:mt-0">
                            🛡️ لوحة الإشراف
                        </Link>
                    )}
                </div>

                {/* عرض الكروت */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {makhdumeen
                        .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
                        .map((m) => (
                        <Link to={`/makhdoom/${m._id}`} key={m._id} className="block group">
                            <div className="bg-white p-5 sm:p-6 rounded-lg shadow group-hover:shadow-lg transition cursor-pointer border-l-4 border-blue-500 relative overflow-hidden">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800">{m.name}</h3>
                                <div className="mt-3 flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">مجموع النقاط</span>
                                    <span className="text-2xl sm:text-3xl font-bold text-blue-600">{m.totalPoints}</span>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {makhdumeen.length === 0 && <p className="text-center w-full text-gray-500 mt-4">لا يوجد مخدومين مسجلين</p>}
                </div>
            </div>
        </div>
    );
}
