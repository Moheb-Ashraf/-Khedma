import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

export default function MakhdoomProfile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [info, setInfo] = useState(null);
    const [history, setHistory] = useState([]);

    const [category, setCategory] = useState('injil');
    const [bookName, setBookName] = useState('');
    const [chapter, setChapter] = useState('');
    const [verses, setVerses] = useState('');
    const [versesCount, setVersesCount] = useState('');

    const [showBonus, setShowBonus] = useState(false);
    const [bonusType, setBonusType] = useState('add');
    const [bonusDesc, setBonusDesc] = useState('');
    const [bonusPoints, setBonusPoints] = useState('');

    useEffect(() => {
        fetchDetails();
    }, []);

    const fetchDetails = async () => {
        try {
            const res = await api.get(`/makhdoom-details/${id}`);
            setInfo(res.data.info);
            setHistory(res.data.history);
        } catch {
            toast.error("خطأ في تحميل البيانات");
        }
    };

    const handleAttendance = async () => {
        try {
            await api.post('/attendance', { makhdoomId: id });
            toast.success("تم تسجيل الحضور (+5)");
            fetchDetails();
        } catch {
            toast.error("خطأ في التسجيل");
        }
    };

    const handleBonus = async (e) => {
        e.preventDefault();
        try {
            let finalPoints = Number(bonusPoints);
            if (bonusType === 'deduct') finalPoints *= -1;

            await api.post('/add-bonus', {
                makhdoomId: id,
                points: finalPoints,
                description: bonusDesc
            });

            toast.success("تم تنفيذ العملية");
            setShowBonus(false);
            setBonusDesc('');
            setBonusPoints('');
            fetchDetails();
        } catch {
            toast.error("خطأ في العملية");
        }
    };

    const handleSubmitRecord = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                makhdoomId: id,
                category,
                bookName: category === 'mazmour' ? '' : bookName,
                chapter,
                verses,
                versesCount: category === 'mazmour' ? versesCount : 0
            };

            const res = await api.post('/add-record', payload);
            toast.success(`تم التسجيل (+${res.data.pointsAdded})`);

            setBookName('');
            setChapter('');
            setVerses('');
            setVersesCount('');
            fetchDetails();
        } catch {
            toast.error("حدث خطأ");
        }
    };

    const handleDeleteMakhdoom = async () => {
        if (!window.confirm("هل أنت متأكد من الحذف النهائي؟")) return;
        try {
            await api.delete(`/delete-makhdoom/${id}`);
            toast.success("تم الحذف");
            navigate('/dashboard');
        } catch {
            toast.error("فشل الحذف");
        }
    };

    if (!info) return <p className="text-center mt-10">جاري التحميل...</p>;

    return (
        <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
            
            <button
                onClick={() => navigate('/dashboard')}
                className="mb-4 text-blue-600 font-bold"
            >
                ← رجوع
            </button>

            {/* Header */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6
                            flex flex-col sm:flex-row gap-4 items-center justify-between border-t-4 border-blue-500">
                
                <div className="text-center sm:text-right">
                    <h1 className="text-2xl sm:text-3xl font-bold">{info.name}</h1>
                    <p className="text-sm text-gray-500">{info.phone || 'غير مسجل'}</p>
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-500">إجمالي النقاط</p>
                    <p className={`text-3xl font-bold ${info.totalPoints < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {info.totalPoints}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button onClick={handleAttendance}
                        className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto">
                        تسجيل حضور
                    </button>
                    <button onClick={() => setShowBonus(!showBonus)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded w-full sm:w-auto">
                        مكافأة / خصم
                    </button>
                </div>
            </div>

            {/* Bonus Form */}
            {showBonus && (
                <div className="bg-white p-4 rounded shadow mb-6">
                    <form onSubmit={handleBonus} className="flex flex-col sm:flex-row gap-2">
                        <input
                            className="flex-1 p-2 border rounded"
                            placeholder="السبب"
                            required
                            value={bonusDesc}
                            onChange={e => setBonusDesc(e.target.value)}
                        />
                        <input
                            type="number"
                            min="1"
                            className="w-full sm:w-24 p-2 border rounded"
                            placeholder="نقاط"
                            required
                            value={bonusPoints}
                            onChange={e => setBonusPoints(e.target.value)}
                        />
                        <button
                            className={`text-white px-6 py-2 rounded ${
                                bonusType === 'add' ? 'bg-green-600' : 'bg-red-600'
                            }`}>
                            تنفيذ
                        </button>
                    </form>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-4 rounded-lg shadow lg:sticky lg:top-4">
                        <h2 className="font-bold mb-4">تسجيل محفوظات</h2>
                        <form onSubmit={handleSubmitRecord} className="space-y-3">
                            <select
                                className="w-full p-2 border rounded"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                <option value="injil">إنجيل</option>
                                <option value="mazmour">مزمور</option>
                            </select>

                            {category === 'injil' && (
                                <input
                                    className="w-full p-2 border rounded"
                                    placeholder="اسم السفر"
                                    value={bookName}
                                    onChange={e => setBookName(e.target.value)}
                                />
                            )}

                            <input
                                className="w-full p-2 border rounded"
                                placeholder="الإصحاح / رقم المزمور"
                                value={chapter}
                                onChange={e => setChapter(e.target.value)}
                            />

                            <input
                                className="w-full p-2 border rounded"
                                placeholder="الآيات"
                                value={verses}
                                onChange={e => setVerses(e.target.value)}
                            />

                            {category === 'mazmour' && (
                                <input
                                    className="w-full p-2 border rounded"
                                    placeholder="عدد الآيات"
                                    value={versesCount}
                                    onChange={e => setVersesCount(e.target.value)}
                                />
                            )}

                            <button className="w-full bg-blue-600 text-white py-2 rounded">
                                حفظ
                            </button>
                        </form>
                    </div>
                </div>

                {/* History */}
                <div className="lg:col-span-2 space-y-3">
                    {history.map(rec => (
                        <div key={rec._id} className="bg-white p-4 rounded shadow text-sm">
                            <div className="flex justify-between">
                                <span>{rec.type}</span>
                                <span className={rec.pointsEarned < 0 ? 'text-red-600' : 'text-green-600'}>
                                    {rec.pointsEarned}
                                </span>
                            </div>
                            <p className="text-gray-500">{rec.description || rec.book}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-10 text-center">
                <button
                    onClick={handleDeleteMakhdoom}
                    className="text-red-600 border border-red-300 px-4 py-2 rounded">
                    حذف المخدوم نهائياً
                </button>
            </div>
        </div>
    );
}
