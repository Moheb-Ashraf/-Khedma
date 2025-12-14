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

    // تحميل البيانات عند أول دخول
    useEffect(() => {
        fetchDetails();
    }, []);

    // ==========================
    // دوال Toast + API
    // ==========================

    const fetchDetails = async () => {
        const toastId = toast.loading("جاري التحميل ...");
        try {
            const res = await api.get(`/makhdoom-details/${id}`);
            setInfo(res.data.info);
            setHistory(res.data.history);
            toast.success("تم تحميل البيانات", { id: toastId });
        } catch {
            toast.error("خطأ في تحميل البيانات", { id: toastId });
        }
    };

    const handleAttendance = async () => {
        const toastId = toast.loading("جاري تسجيل الحضور...");
        try {
            await api.post('/attendance', { makhdoomId: id });
            toast.success("تم تسجيل الحضور (+5)", { id: toastId });
            fetchDetails();
        } catch {
            toast.error("خطأ في التسجيل", { id: toastId });
        }
    };

    const handleBonus = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("جاري تنفيذ العملية...");
        try {
            let finalPoints = Number(bonusPoints);
            if (bonusType === 'deduct') finalPoints *= -1;

            await api.post('/add-bonus', {
                makhdoomId: id,
                points: finalPoints,
                description: bonusDesc
            });

            toast.success(
                bonusType === 'deduct' 
                    ? `تم خصم ${bonusPoints} نقطة` 
                    : `تم إضافة ${bonusPoints} نقطة`, 
                { id: toastId }
            );

            setShowBonus(false);
            setBonusDesc('');
            setBonusPoints('');
            fetchDetails();
        } catch {
            toast.error("خطأ في العملية", { id: toastId });
        }
    };

    const handleSubmitRecord = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("جاري حفظ السجل...");
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
            toast.success(`تم التسجيل (+${res.data.pointsAdded})`, { id: toastId });

            setBookName('');
            setChapter('');
            setVerses('');
            setVersesCount('');
            fetchDetails();
        } catch {
            toast.error("حدث خطأ", { id: toastId });
        }
    };

    const handleDeleteMakhdoom = async () => {
        if (!window.confirm("هل أنت متأكد من الحذف النهائي؟")) return;

        const toastId = toast.loading("جاري الحذف...");
        try {
            await api.delete(`/delete-makhdoom/${id}`);
            toast.success("تم الحذف", { id: toastId });
            navigate('/dashboard');
        } catch {
            toast.error("فشل الحذف", { id: toastId });
        }
    };

    // ==========================
    // واجهة المستخدم (بسيطة)
    // ==========================
    if (!info) return <p className="text-center mt-10">جاري التحميل...</p>;

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <button onClick={() => navigate('/dashboard')} className="mb-4 text-blue-600 font-bold">
                ← رجوع
            </button>

            {/* Header */}
            <div className="bg-white p-4 rounded shadow mb-6 flex justify-between items-center border-t-4 border-blue-500">
                <div>
                    <h1 className="text-2xl font-bold">{info.name}</h1>
                    <p className="text-gray-500">{info.phone || 'غير مسجل'}</p>
                </div>
                <div>
                    <p>إجمالي النقاط</p>
                    <p className={info.totalPoints < 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                        {info.totalPoints}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleAttendance} className="bg-blue-600 text-white px-4 py-2 rounded">
                        حضور
                    </button>
                    <button onClick={() => setShowBonus(!showBonus)} className="bg-yellow-500 text-white px-4 py-2 rounded">
                        مكافأة / خصم
                    </button>
                </div>
            </div>

            {/* Bonus Form */}
            {showBonus && (
                <form onSubmit={handleBonus} className="bg-white p-4 rounded shadow mb-6 flex gap-2">
                    <input
                        className="flex-1 p-2 border rounded"
                        placeholder="السبب"
                        required
                        value={bonusDesc}
                        onChange={e => setBonusDesc(e.target.value)}
                    />
                    <input
                        type="number"
                        className="w-24 p-2 border rounded"
                        placeholder="نقاط"
                        required
                        value={bonusPoints}
                        onChange={e => setBonusPoints(e.target.value)}
                    />
                    <button className={`px-4 py-2 rounded text-white ${bonusType === 'add' ? 'bg-green-600' : 'bg-red-600'}`}>
                        تنفيذ
                    </button>
                </form>
            )}

            {/* سجل المتابعة */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <form onSubmit={handleSubmitRecord} className="lg:col-span-1 bg-white p-4 rounded shadow space-y-2">
                    <select className="w-full p-2 border rounded" value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="injil">إنجيل</option>
                        <option value="mazmour">مزمور</option>
                    </select>
                    {category === 'injil' && (
                        <input className="w-full p-2 border rounded" placeholder="اسم السفر" value={bookName} onChange={e => setBookName(e.target.value)} />
                    )}
                    <input className="w-full p-2 border rounded" placeholder="الإصحاح / رقم المزمور" value={chapter} onChange={e => setChapter(e.target.value)} />
                    <input className="w-full p-2 border rounded" placeholder="الآيات" value={verses} onChange={e => setVerses(e.target.value)} />
                    {category === 'mazmour' && (
                        <input className="w-full p-2 border rounded" placeholder="عدد الآيات" value={versesCount} onChange={e => setVersesCount(e.target.value)} />
                    )}
                    <button className="w-full bg-blue-600 text-white py-2 rounded">حفظ</button>
                </form>

                {/* سجل النشاط */}
                <div className="lg:col-span-2 space-y-2">
                    {history.map(rec => (
                        <div key={rec._id} className="bg-white p-3 rounded shadow flex justify-between">
                            <span>{rec.type}</span>
                            <span className={rec.pointsEarned < 0 ? 'text-red-600' : 'text-green-600'}>
                                {rec.pointsEarned}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 text-center">
                <button onClick={handleDeleteMakhdoom} className="text-blue-300 border bg-red-600  cursor-pointer border-red-300 px-4 py-2 rounded">
                    حذف المخدوم نهائياً
                </button>
            </div>
        </div>
    );
}
