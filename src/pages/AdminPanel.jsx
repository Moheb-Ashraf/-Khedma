import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function AdminPanel() {
    const [logs, setLogs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('role') !== 'admin') {
            navigate('/dashboard');
            return;
        }

        const fetchLogs = async () => {
            try {
                const res = await api.get('/admin/logs');
                setLogs(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
            <div className="max-w-full md:max-w-6xl mx-auto bg-white rounded shadow-lg p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b gap-3 sm:gap-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-red-600 flex items-center gap-2">
                        🛡️ لوحة مراقبة الخدمة
                    </h1>
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded text-sm sm:text-base"
                    >
                        عودة للرئيسية
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-[600px] w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700 text-xs sm:text-sm">
                                <th className="p-2 sm:p-3 border">الخادم المسجل</th>
                                <th className="p-2 sm:p-3 border">المخدوم</th>
                                <th className="p-2 sm:p-3 border">النوع</th>
                                <th className="p-2 sm:p-3 border">التفاصيل / السبب</th>
                                <th className="p-2 sm:p-3 border">النقاط</th>
                                <th className="p-2 sm:p-3 border">التوقيت</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log._id} className="hover:bg-gray-50 border-b text-xs sm:text-sm">
                                    <td className="p-2 sm:p-3 border font-bold text-blue-800">
                                        {log.servantId?.name || log.servantEmail}
                                    </td>
                                    <td className="p-2 sm:p-3 border font-bold text-gray-800">
                                        {log.makhdoomId?.name || "مخدوم محذوف"}
                                    </td>
                                    <td className="p-2 sm:p-3 border">
                                        {log.type === 'bonus' ? '⭐ بونص' : log.type === 'mazmour' ? '📖 مزمور' : '✝️ إنجيل'}
                                    </td>
                                    <td className="p-2 sm:p-3 border text-gray-600">
                                        {log.type === 'bonus' ? log.description : `${log.book} ${log.chapter || ''} : ${log.verses || ''}`}
                                    </td>
                                    <td className="p-2 sm:p-3 border font-bold text-green-600">+{log.pointsEarned}</td>
                                    <td className="p-2 sm:p-3 border text-gray-400" dir="ltr">
                                        {new Date(log.date).toLocaleString('ar-EG')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
