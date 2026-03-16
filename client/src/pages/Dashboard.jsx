import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { 
  Activity, 
  Plus, 
  Trash2, 
  LogOut, 
  ExternalLink,
  Percent,
  Moon,
  Sun
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import toast from 'react-hot-toast';

import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const calculateUptime = (logs) => {
  if (!logs || logs.length === 0) return 100;
  const upCount = logs.filter(log => log.isUp).length;
  return ((upCount / logs.length) * 100).toFixed(1);
};

const Dashboard = () => {
  const [monitors, setMonitors] = useState([]);
  const [newMonitor, setNewMonitor] = useState({ name: '', url: '', interval: 1 });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const { logout } = useAuth();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const fetchMonitors = async () => {
      try {
        const { data } = await API.get('/monitors');
        const updatedData = data.map(m => ({ ...m, logs: m.logs || [] }));
        setMonitors(updatedData);
      } catch (err) {
        toast.error("Monitörler yüklenemedi. Sunucu bağlantısını kontrol edin.");
      }
    };

    fetchMonitors();
    const socket = io('http://localhost:5000');

    socket.on('newPingResult', (data) => {
      setMonitors(prev => prev.map(m => {
        if (m.id === data.monitorId) {
          const updatedLogs = [data.log, ...(m.logs || [])].slice(0, 15);
          return { ...m, lastStatus: data.log.isUp, logs: updatedLogs };
        }
        return m;
      }));
    });

    return () => socket.disconnect();
  }, []);

  const handleAddMonitor = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('İzleyici ekleniyor...');
    try {
      const { data } = await API.post('/monitors', newMonitor);
      setMonitors([...monitors, { ...data.monitor, logs: [] }]);
      setNewMonitor({ name: '', url: '', interval: 1 });
      toast.success('İzleyici başarıyla eklendi!', { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ekleme işlemi başarısız oldu.', { id: loadingToast });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu izleyiciyi silmek istediğinize emin misiniz?")) return;
    try {
      await API.delete(`/monitors/${id}`);
      setMonitors(monitors.filter(m => m.id !== id));
      toast.success('İzleyici silindi.');
    } catch (err) {
      toast.error('Silme işlemi sırasında bir hata oluştu.');
    }
  };

  const totalMonitors = monitors.length;
  const onlineMonitors = monitors.filter(m => m.lastStatus === true).length;
  const offlineMonitors = monitors.filter(m => m.lastStatus === false).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-10 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-2xl shadow-lg shadow-blue-500/30">
            <Activity size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight">
              Uptime Dashboard
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Sistemleriniz anlık olarak izleniyor
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            title={isDarkMode ? "Gündüz Moduna Geç" : "Gece Moduna Geç"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button 
            onClick={logout} 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md"
          >
            <LogOut size={18} /> Çıkış
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border-b-4 border-blue-500 text-center transition-colors">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-wider mb-2">TOPLAM İZLEME</p>
          <h2 className="text-4xl font-extrabold text-slate-800 dark:text-white">{totalMonitors}</h2>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border-b-4 border-emerald-500 text-center transition-colors">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-wider mb-2">ONLINE (AKTİF)</p>
          <h2 className="text-4xl font-extrabold text-emerald-500 dark:text-emerald-400">{onlineMonitors}</h2>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border-b-4 border-rose-500 text-center transition-colors">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-wider mb-2">OFFLINE (ÇÖKTÜ)</p>
          <h2 className="text-4xl font-extrabold text-rose-500 dark:text-rose-400">{offlineMonitors}</h2>
        </div>
      </div>
      <section className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm mb-10 border border-slate-100 dark:border-slate-700 transition-colors">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white mb-6">
          <Plus size={20} className="text-blue-500" /> Yeni İzleyici Tanımla
        </h3>
        <form onSubmit={handleAddMonitor} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <input 
            className="md:col-span-4 p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            type="text" placeholder="Proje Adı (Örn: Blog Sitem)" 
            value={newMonitor.name} 
            onChange={e => setNewMonitor({...newMonitor, name: e.target.value})} 
            required 
          />
          <input 
            className="md:col-span-5 p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            type="url" placeholder="https://url-adresi.com" 
            value={newMonitor.url} 
            onChange={e => setNewMonitor({...newMonitor, url: e.target.value})} 
            required 
          />
          <input 
            className="md:col-span-2 p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            type="number" placeholder="Dakika" min="1"
            value={newMonitor.interval} 
            onChange={e => setNewMonitor({...newMonitor, interval: e.target.value})} 
            required 
          />
          <button type="submit" className="md:col-span-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg">
            Ekle
          </button>
        </form>
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {monitors.map(monitor => {
          const uptimePercent = calculateUptime(monitor.logs);
          const isUptimeGood = uptimePercent >= 90;

          return (
            <div 
              key={monitor.id} 
              className={`bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all border-t-4 flex flex-col justify-between ${monitor.lastStatus ? 'border-emerald-500' : 'border-rose-500'}`}
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="pr-4">
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white truncate">{monitor.name}</h4>
                    <a href={monitor.url} target="_blank" rel="noreferrer" className="text-sm text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 flex items-center gap-1 mt-1 transition-colors truncate">
                      {monitor.url} <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className={`p-3 rounded-xl shrink-0 ${monitor.lastStatus ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/30'}`}>
                    <Activity size={20} className={monitor.lastStatus ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'} />
                  </div>
                </div>
                <div className="h-32 w-full my-6">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2 tracking-wide">TEPKİ SÜRESİ (ms)</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[...(monitor.logs || [])].reverse()}>
                      <Line 
                        type="monotone" 
                        dataKey="responseTime" 
                        stroke={monitor.lastStatus ? '#10b981' : '#f43f5e'} 
                        strokeWidth={3} 
                        dot={false} 
                        isAnimationActive={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                          borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                          borderRadius: '8px', 
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', 
                          color: isDarkMode ? '#f8fafc' : '#0f172a',
                          fontSize: '12px', 
                          fontWeight: '600' 
                        }}
                        labelStyle={{ display: 'none' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex justify-between items-center pt-5 mt-2 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${monitor.lastStatus ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/30'}`}>
                    <div className={`w-2 h-2 rounded-full ${monitor.lastStatus ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`}></div>
                    <span className={`text-xs font-bold tracking-wide ${monitor.lastStatus ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {monitor.lastStatus ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>

                  <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border ${isUptimeGood ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'}`}>
                    <Percent size={12} className={isUptimeGood ? 'text-slate-500 dark:text-slate-400' : 'text-rose-600 dark:text-rose-400'} />
                    <span className={`text-xs font-bold ${isUptimeGood ? 'text-slate-600 dark:text-slate-300' : 'text-rose-600 dark:text-rose-400'}`}>
                      {uptimePercent}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => handleDelete(monitor.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={16} /> <span className="text-sm font-semibold">Sil</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;