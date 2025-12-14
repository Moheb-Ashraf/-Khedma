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

    // ==========================
    // دوال التعامل مع البيانات
    // ==========================

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
        const toastId = toast.loading("جاري التسجيل...");
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
        const toastId = toast.loading("جاري التنفيذ...");
        try {
            let finalPoints = Number(bonusPoints);
            if (bonusType === 'deduct') finalPoints *= -1;

            await api.post('/add-bonus', {
                makhdoomId: id,
                points: finalPoints,
                description: bonusDesc
            });

            toast.success(bonusType === 'deduct' ? "تم الخصم" : "تمت الإضافة", { id: toastId });
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
        const toastId = toast.loading("جاري الحفظ...");
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
            toast.success(`تم (+${res.data.pointsAdded})`, { id: toastId });

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
        if (!window.confirm("تحذير: هل أنت متأكد من الحذف النهائي؟")) return;
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
    // واجهة المستخدم (Responsive)
    // ==========================
    if (!info) return <div className="flex justify-center items-center h-screen"><p className="text-gray-500 animate-pulse">جاري التحميل...</p></div>;

    return (
        <div className="min-h-screen bg-gray-100 p-3 md:p-6 pb-20">
            {/* زر الرجوع */}
            <button onClick={() => navigate('/dashboard')} className="mb-4 flex items-center text-blue-600 font-bold hover:bg-blue-50 px-3 py-2 rounded transition w-fit">
                <span className="ml-2 text-xl">←</span> رجوع للقائمة
            </button>

            {/* بطاقة المعلومات الرئيسية (Header) */}
            <div className="bg-white p-5 rounded-xl shadow-sm mb-6 border-t-4 border-blue-500 flex flex-col md:flex-row justify-between items-center gap-6">
                
                {/* الاسم والموبايل */}
                <div className="text-center md:text-right w-full md:w-auto">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 break-words">{info.name}</h1>
                    <p className="text-gray-500 mt-1 text-sm">{info.phone || 'رقم الموبايل غير مسجل'}</p>
                </div>
                
                {/* النقاط */}
                <div className="text-center bg-gray-50 px-6 py-3 rounded-lg border border-gray-100 w-full md:w-auto">
                    <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">الرصيد الحالي</p>
                    <p className={`text-3xl md:text-4xl font-bold ${info.totalPoints < 0 ? 'text-red-600' : 'text-green-600'}`} dir="ltr">
                        {info.totalPoints}
                    </p>
                </div>
                
                {/* أزرار الإجراءات السريعة */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button onClick={handleAttendance} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow-sm font-medium transition active:scale-95 text-sm md:text-base">
                        تسجيل حضور
                    </button>
                    <button onClick={() => setShowBonus(!showBonus)} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-3 rounded-lg shadow-sm font-medium transition active:scale-95 text-sm md:text-base">
                        مكافأة / خصم
                    </button>
                </div>
            </div>

            {/* فورم البونص (يظهر ويختفي) */}
            {showBonus && (
                <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-yellow-300 animate-fade-in">
                    <div className="flex gap-2 mb-3">
                        <button onClick={() => setBonusType('add')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${bonusType === 'add' ? 'bg-green-100 text-green-700 ring-1 ring-green-300' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>إضافة (+)</button>
                        <button onClick={() => setBonusType('deduct')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${bonusType === 'deduct' ? 'bg-red-100 text-red-700 ring-1 ring-red-300' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>خصم (-)</button>
                    </div>
                    {/* فورم البونص Responsive: تحت بعض في الموبايل وجنب بعض في الشاشات الأكبر */}
                    <form onSubmit={handleBonus} className="flex flex-col sm:flex-row gap-3">
                        <input
                            className="flex-[2] p-3 border rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50 focus:bg-white transition"
                            placeholder={bonusType === 'add' ? "سبب المكافأة (مثال: حفظ)" : "سبب الخصم (مثال: شغب)"}
                            required
                            value={bonusDesc}
                            onChange={e => setBonusDesc(e.target.value)}
                        />
                        <input
                            type="number"
                            className="flex-1 sm:w-24 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50 focus:bg-white transition"
                            placeholder="النقاط"
                            required
                            min="1"
                            value={bonusPoints}
                            onChange={e => setBonusPoints(e.target.value)}
                        />
                        <button className={`p-3 rounded-lg text-white font-bold shadow-md transition active:scale-95 sm:w-24 ${bonusType === 'add' ? 'bg-green-600' : 'bg-red-600'}`}>
                            تنفيذ
                        </button>
                    </form>
                </div>
            )}

            {/* Grid Layout: عمود واحد في الموبايل، 3 أعمدة في الشاشات الكبيرة */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. فورم التسجيل (يمين الشاشة في الديسكتوب، فوق في الموبايل) */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleSubmitRecord} className="bg-white p-5 rounded-xl shadow-sm sticky top-4">
                        <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
                            <span>📖</span> تسجيل جديد
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 block mb-1.5">اختر النوع</label>
                                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                                    <button type="button" onClick={() => setCategory('injil')} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${category === 'injil' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>إنجيل</button>
                                    <button type="button" onClick={() => setCategory('mazmour')} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${category === 'mazmour' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>مزمور</button>
                                </div>
                            </div>
                            
                            {category === 'injil' && (
                                <div>
                                    <input className="w-full p-3 border rounded-lg outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition" placeholder="اسم السفر (مثال: يوحنا)" value={bookName} onChange={e => setBookName(e.target.value)} />
                                </div>
                            )}
                            
                            <div className="flex gap-3">
                                <input className="flex-1 min-w-0 p-3 border rounded-lg outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition" type="number" placeholder={category === 'mazmour' ? "رقم المزمور" : "الإصحاح"} value={chapter} onChange={e => setChapter(e.target.value)} />
                                <input className="flex-1 min-w-0 p-3 border rounded-lg outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition" placeholder="الآيات (1-5)" value={verses} onChange={e => setVerses(e.target.value)} />
                            </div>

                            {category === 'mazmour' && (
                                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                                    <label className="text-xs font-bold text-orange-800 block mb-1">عدد آيات المزمور</label>
                                    <input className="w-full p-2 border border-orange-200 rounded-md outline-none focus:ring-1 focus:ring-orange-400" type="number" placeholder="اكتب العدد لحساب النقاط" value={versesCount} onChange={e => setVersesCount(e.target.value)} />
                                </div>
                            )}
                            
                            <button className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg font-bold shadow-md transition active:scale-95 mt-2">
                                حفظ في السجل
                            </button>
                        </div>
                    </form>
                </div>

                {/* 2. سجل النشاط (يسار الشاشة في الديسكتوب، تحت في الموبايل) */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden min-h-[400px]">
                        <div className="bg-gray-50 p-4 border-b font-bold text-gray-700 flex justify-between items-center">
                            <span className="flex items-center gap-2">🗂️ سجل النشاط</span>
                            <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded border">الأحدث أولاً</span>
                        </div>
                        
                        <div className="divide-y overflow-y-auto max-h-[600px]">
                            {history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                    <span className="text-4xl mb-2">📂</span>
                                    <p>لا يوجد سجلات حتى الآن</p>
                                </div>
                            ) : (
                                history.map(rec => (
                                    <div key={rec._id} className="p-4 hover:bg-gray-50 transition flex items-center justify-between gap-3">
                                        
                                        {/* الجزء اليمين: الأيقونة والتفاصيل */}
                                        <div className="flex items-start gap-3 overflow-hidden">
                                            {/* الأيقونة/البادج */}
                                            <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm ${
                                                rec.type === 'bonus' ? 'bg-yellow-100 text-yellow-600' :
                                                rec.type === 'mazmour' ? 'bg-orange-100 text-orange-600' :
                                                'bg-blue-100 text-blue-600'
                                            }`}>
                                                {rec.type === 'bonus' ? '⭐' : rec.type === 'mazmour' ? '📜' : '✝️'}
                                            </div>

                                            <div className="flex flex-col min-w-0">
                                                {/* الشاهد أو الوصف - يقطع الكلام لو طويل */}
                                                <span className="font-bold text-gray-800 text-sm md:text-base break-words leading-tight">
                                                    {rec.type === 'bonus' 
                                                        ? rec.description 
                                                        : <span dir="rtl">{rec.book || 'المزامير'} {rec.chapter} {rec.verses ? ': ' + rec.verses : ''}</span>
                                                    }
                                                </span>
                                                {/* التاريخ والنوع */}
                                                <div className="text-xs text-gray-400 mt-1 flex gap-2 items-center">
                                                    <span>{new Date(rec.date).toLocaleDateString('ar-EG')}</span>
                                                    <span className="text-gray-300">•</span>
                                                    <span className={rec.type === 'bonus' ? 'text-yellow-600' : rec.type === 'mazmour' ? 'text-orange-600' : 'text-blue-600'}>
                                                        {rec.type === 'bonus' ? 'بونص' : rec.type === 'mazmour' ? 'مزمور' : 'إنجيل'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* الجزء اليسار: النقاط */}
                                        <div className={`font-bold text-lg md:text-xl flex-shrink-0 ${rec.pointsEarned < 0 ? 'text-red-600' : 'text-green-600'}`} dir="ltr">
                                            {rec.pointsEarned > 0 ? '+' : ''}{rec.pointsEarned}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* زر الحذف النهائي */}
            <div className="mt-12 mb-6 text-center">
                <button 
                    onClick={handleDeleteMakhdoom} 
                    className="group text-red-400 hover:text-red-600 text-sm transition flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-lg hover:bg-red-50"
                >
                    <span className="group-hover:scale-110 transition">⚠️</span> حذف هذا المخدوم نهائياً
                </button>
            </div>
        </div>
    );
}