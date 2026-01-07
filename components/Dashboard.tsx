import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, Brush
} from 'recharts';
import { Activity, Droplets, Thermometer, Zap, Clock, AlertTriangle, RefreshCw, Lock, Loader2, Download } from 'lucide-react';
import { getRealtimeData, getHistoryData, setRelayStatus, setTimer } from '../services/api';
import { RealtimeData, HistoryItem, HistoryPeriod } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-300 ${className}`}>
    <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center transition-colors duration-300">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const SensorMetric: React.FC<{ label: string; value: string | number; unit: string; status: string; icon: React.ReactNode; color: string; bgColor: string }> = ({ label, value, unit, status, icon, color, bgColor }) => (
  <div className="flex items-center p-4 bg-white dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors duration-300">
    <div className={`p-3 rounded-full ${bgColor} dark:bg-slate-900 ${color} mr-4 transition-colors duration-300`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</span>
        <span className="text-slate-500 mb-1">{unit}</span>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${status === 'Ideal' || status === 'Optimal' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
        {status}
      </span>
    </div>
  </div>
);

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-xl text-xs backdrop-blur-sm z-50 min-w-[150px]">
        <p className="text-slate-500 dark:text-slate-400 mb-2 font-medium border-b border-slate-200 dark:border-slate-800 pb-1">
          {payload[0].payload.fullDate}
        </p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}:
              </span>
              <span className="font-bold font-mono text-slate-700 dark:text-slate-200">
                {entry.value}
                <span className="text-[10px] ml-0.5 opacity-70">
                   {entry.name.includes('Suhu') ? '°C' : entry.name.includes('TDS') ? 'ppm' : ''}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

interface DashboardProps {
  isDark: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ isDark }) => {
  const { isAuthenticated, openLoginModal } = useAuth();
  const [realtime, setRealtime] = useState<RealtimeData | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyPeriod, setHistoryPeriod] = useState<HistoryPeriod>('1hour');
  
  // Loading states
  const [loading, setLoading] = useState(true); // Initial/History load
  const [refreshing, setRefreshing] = useState(false); // Background refresh
  const [processing, setProcessing] = useState<{[key: string]: boolean}>({}); // Button specific loading

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Input states for timers
  const [timers, setTimers] = useState({
    t1On: '', t1Off: '', t2On: '', t2Off: ''
  });

  const fetchData = useCallback(async (isBackgroundRefresh = true) => {
    if (isBackgroundRefresh) setRefreshing(true);
    try {
      const data = await getRealtimeData();
      setRealtime(data);
      setLastUpdated(new Date());

      const formatTime = (isoString: string) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return isNaN(d.getTime()) ? '' : d.toISOString().substring(11, 16);
      };

      const activeElement = document.activeElement;
      const isTimerFocused = activeElement instanceof HTMLInputElement && activeElement.type === 'time';
      
      if (!isTimerFocused) {
        setTimers({
            t1On: formatTime(data.timer1On),
            t1Off: formatTime(data.timer1Off),
            t2On: formatTime(data.timer2On),
            t2Off: formatTime(data.timer2Off),
        });
      }

    } catch (error) {
      console.error("Failed to fetch realtime data", error);
    } finally {
      if (isBackgroundRefresh) setRefreshing(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHistoryData(historyPeriod);
      // Ensure numeric values and formatted time
      const formatted = Array.isArray(data) ? data.map(d => {
        const date = new Date(d.timestamp);
        let displayTime = '';
        
        if (historyPeriod === '1week') {
            displayTime = date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ' ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        } else {
            displayTime = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        }

        return {
          ...d,
          suhu: Number(d.suhu),
          ph: Number(d.ph),
          tds: Number(d.tds),
          displayTime: displayTime,
          fullDate: date.toLocaleString(),
          rawDate: date // keep for sorting
        };
      }) : [];

      // Sort Ascending (Oldest to Newest) for Left-to-Right graph
      formatted.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

      setHistory(formatted);
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  }, [historyPeriod]);

  // Initial load and polling
  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(true), 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchData]);

  // Load history when period changes
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleRelayToggle = async (relay: 'relay1' | 'relay2', currentStatus: string) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    
    // Prevent multiple clicks
    if (processing[relay]) return;

    const newStatus = currentStatus === 'on' ? false : true;
    
    setProcessing(prev => ({ ...prev, [relay]: true }));

    try {
      await setRelayStatus(relay, newStatus);
      await new Promise(r => setTimeout(r, 800));
      await fetchData(false); 
      
    } catch (error) {
      console.error("Failed to toggle relay", error);
      alert("Failed to update relay status. Please check connection.");
    } finally {
      setProcessing(prev => ({ ...prev, [relay]: false }));
    }
  };

  const handleTimerInput = (key: keyof typeof timers, value: string) => {
    setTimers(prev => ({ ...prev, [key]: value }));
  };

  const handleTimerSave = async (key: 'timer1On' | 'timer1Off' | 'timer2On' | 'timer2Off', value: string) => {
    if (!isAuthenticated) return; 
    
    setProcessing(prev => ({ ...prev, [key]: true }));
    try {
      await setTimer(key, value);
      await new Promise(r => setTimeout(r, 800));
      await fetchData(false);
    } catch (error) {
      console.error("Failed to set timer", error);
    } finally {
       setProcessing(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleExportCSV = () => {
    if (!history || history.length === 0) return;

    // Define CSV headers
    const headers = ['Timestamp', 'Date', 'Time', 'Temperature (C)', 'pH', 'TDS (ppm)'];
    
    // Create CSV rows
    const csvContent = [
      headers.join(','),
      ...history.map(item => {
        const date = item.rawDate instanceof Date ? item.rawDate : new Date(item.timestamp);
        // Handle potential commas in string fields by quoting
        const safeDateStr = date.toLocaleDateString(); 
        const safeTimeStr = date.toLocaleTimeString();

        return [
          `"${item.timestamp}"`, // Full ISO
          `"${safeDateStr}"`,
          `"${safeTimeStr}"`,
          item.suhu,
          item.ph,
          item.tds
        ].join(',');
      })
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aquasmart_history_${historyPeriod}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!realtime) {
    return (
      <div className="flex h-full items-center justify-center p-20 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-2" />
        <span>Connecting to Aquascape...</span>
      </div>
    );
  }

  // Colors
  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const brushStroke = isDark ? "#475569" : "#cbd5e1";
  const brushFill = isDark ? "#1e293b" : "#f1f5f9";
  
  // Custom Dot for Charts
  const CustomDot = (props: any) => {
    const { cx, cy, stroke, payload } = props;
    return (
      <circle cx={cx} cy={cy} r={3} stroke={stroke} strokeWidth={2} fill={isDark ? "#0f172a" : "#fff"} />
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">Dashboard Overview</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Last synced: {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <div className="flex gap-2">
             <button onClick={() => fetchData(true)} disabled={refreshing} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-cyan-600 dark:text-cyan-400 transition-colors shadow-sm">
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
             </button>
        </div>
      </div>

      {/* Fuzzy Logic Recommendation Banner */}
      <div className="bg-gradient-to-r from-indigo-100 to-white dark:from-indigo-900/50 dark:to-slate-900/50 border border-indigo-200 dark:border-indigo-500/30 rounded-xl p-6 shadow-lg relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity size={100} className="text-indigo-900 dark:text-indigo-100" />
        </div>
        <div className="relative z-10">
          <h3 className="text-indigo-600 dark:text-indigo-300 font-semibold mb-1 uppercase tracking-wider text-xs">AI Recommendation</h3>
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-indigo-500 dark:text-indigo-400 mt-1 flex-shrink-0" />
            <div>
               <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                 {realtime.fuzzy_rekomendasi || "Evaluating system status..."}
               </p>
               <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
                 Based on current sensors: Temp {realtime.suhu}°C, pH {realtime.ph}, TDS {realtime.tds}ppm.
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sensors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SensorMetric 
          label="Temperature" 
          value={realtime.suhu} 
          unit="°C" 
          status={realtime.suhu_status} 
          icon={<Thermometer className="w-6 h-6 text-rose-500 dark:text-rose-400" />}
          color="text-rose-500 dark:text-rose-400"
          bgColor="bg-rose-100"
        />
        <SensorMetric 
          label="pH Level" 
          value={realtime.ph} 
          unit="pH" 
          status={realtime.ph_status} 
          icon={<Droplets className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />}
          color="text-cyan-600 dark:text-cyan-400"
          bgColor="bg-cyan-100"
        />
        <SensorMetric 
          label="TDS" 
          value={realtime.tds} 
          unit="ppm" 
          status={realtime.tds_status} 
          icon={<Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
          color="text-emerald-600 dark:text-emerald-400"
          bgColor="bg-emerald-100"
        />
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Relay 1 Control */}
        <Card title="Device Control 1">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className={`w-8 h-8 ${realtime.relay1 === 'on' ? 'text-yellow-500 fill-yellow-500/20 dark:text-yellow-400 dark:fill-yellow-400/20' : 'text-slate-400 dark:text-slate-600'}`} />
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">Main Relay 1</h4>
                  <span className={`text-xs ${realtime.relay1 === 'on' ? 'text-green-600 dark:text-green-400' : 'text-slate-500'}`}>
                    Status: {realtime.relay1.toUpperCase()}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => handleRelayToggle('relay1', realtime.relay1)}
                disabled={processing['relay1']}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${realtime.relay1 === 'on' ? 'bg-cyan-600' : 'bg-slate-300 dark:bg-slate-700'} ${processing['relay1'] ? 'opacity-70 cursor-wait' : ''}`}
              >
                {processing['relay1'] ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  </div>
                ) : (
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${realtime.relay1 === 'on' ? 'translate-x-7' : 'translate-x-1'}`} />
                )}
              </button>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-4 space-y-3 border border-slate-100 dark:border-slate-800 transition-colors duration-300 relative group">
              {!isAuthenticated && (
                <div 
                    onClick={openLoginModal}
                    className="absolute inset-0 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-[1px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
                >
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-lg flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <Lock className="w-3 h-3" /> Login to Edit
                    </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Schedule</span>
                {(processing['timer1On'] || processing['timer1Off']) && <Loader2 className="w-3 h-3 animate-spin ml-auto" />}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Start Time</label>
                  <input 
                    type="time" 
                    value={timers.t1On} 
                    onClick={(e) => !isAuthenticated && openLoginModal()}
                    onChange={(e) => handleTimerInput('t1On', e.target.value)}
                    onBlur={(e) => handleTimerSave('timer1On', e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Stop Time</label>
                  <input 
                    type="time" 
                    value={timers.t1Off} 
                    onClick={(e) => !isAuthenticated && openLoginModal()}
                    onChange={(e) => handleTimerInput('t1Off', e.target.value)}
                    onBlur={(e) => handleTimerSave('timer1Off', e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Relay 2 Control */}
        <Card title="Device Control 2">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className={`w-8 h-8 ${realtime.relay2 === 'on' ? 'text-yellow-500 fill-yellow-500/20 dark:text-yellow-400 dark:fill-yellow-400/20' : 'text-slate-400 dark:text-slate-600'}`} />
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">Aux Relay 2</h4>
                  <span className={`text-xs ${realtime.relay2 === 'on' ? 'text-green-600 dark:text-green-400' : 'text-slate-500'}`}>
                    Status: {realtime.relay2.toUpperCase()}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => handleRelayToggle('relay2', realtime.relay2)}
                disabled={processing['relay2']}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${realtime.relay2 === 'on' ? 'bg-cyan-600' : 'bg-slate-300 dark:bg-slate-700'} ${processing['relay2'] ? 'opacity-70 cursor-wait' : ''}`}
              >
                {processing['relay2'] ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  </div>
                ) : (
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${realtime.relay2 === 'on' ? 'translate-x-7' : 'translate-x-1'}`} />
                )}
              </button>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-4 space-y-3 border border-slate-100 dark:border-slate-800 transition-colors duration-300 relative group">
              {!isAuthenticated && (
                <div 
                    onClick={openLoginModal}
                    className="absolute inset-0 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-[1px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
                >
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-lg flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <Lock className="w-3 h-3" /> Login to Edit
                    </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Schedule</span>
                {(processing['timer2On'] || processing['timer2Off']) && <Loader2 className="w-3 h-3 animate-spin ml-auto" />}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Start Time</label>
                  <input 
                    type="time" 
                    value={timers.t2On} 
                    onClick={(e) => !isAuthenticated && openLoginModal()}
                    onChange={(e) => handleTimerInput('t2On', e.target.value)}
                    onBlur={(e) => handleTimerSave('timer2On', e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Stop Time</label>
                  <input 
                    type="time" 
                    value={timers.t2Off} 
                    onClick={(e) => !isAuthenticated && openLoginModal()}
                    onChange={(e) => handleTimerInput('t2Off', e.target.value)}
                    onBlur={(e) => handleTimerSave('timer2Off', e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* History Charts - Combined Single Chart with Multi-Axis */}
      <Card title="Historical Data">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-2">
            {(['1hour', '1day', '1week'] as HistoryPeriod[]).map(p => (
              <button
                key={p}
                onClick={() => setHistoryPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  historyPeriod === p 
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {p === '1hour' ? 'Last Hour' : p === '1day' ? 'Last 24h' : 'Last Week'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            disabled={loading || history.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="w-full h-[450px] min-w-0">
          {loading ? (
             <div className="h-full flex items-center justify-center text-slate-500">Loading chart data...</div>
          ) : (
             <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={history} margin={{ top: 20, right: 10, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.1} vertical={true} />
                <XAxis 
                  dataKey="displayTime" 
                  stroke={axisColor} 
                  tick={{ fill: axisColor, fontSize: 12 }} 
                  minTickGap={40}
                  tickMargin={10}
                />
                
                {/* 1. Suhu Axis (Left) */}
                <YAxis 
                  yAxisId="left"
                  orientation="left" 
                  stroke="#f43f5e" 
                  tick={{ fill: "#f43f5e", fontSize: 12 }}
                  domain={['auto', 'auto']}
                  label={{ value: 'Suhu (°C)', angle: -90, position: 'insideLeft', fill: '#f43f5e', fontSize: 12 }}
                />

                {/* 2. pH Axis (Right) */}
                <YAxis 
                  yAxisId="right_ph"
                  orientation="right" 
                  stroke="#06b6d4" 
                  tick={{ fill: "#06b6d4", fontSize: 12 }}
                  domain={['auto', 'auto']}
                  label={{ value: 'pH', angle: 90, position: 'insideRight', fill: '#06b6d4', fontSize: 12 }}
                />

                {/* 3. TDS Axis (Right - Invisible Axis Line/Ticks but scaled correctly) */}
                <YAxis 
                  yAxisId="right_tds"
                  orientation="right" 
                  domain={['auto', 'auto']}
                  hide // Hide axis visual elements to avoid overlap, but keep scaling logic
                />

                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="square" />

                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="suhu" 
                  name="Suhu (°C)"
                  stroke="#f43f5e" 
                  strokeWidth={2}
                  dot={<CustomDot />}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  yAxisId="right_ph"
                  type="monotone" 
                  dataKey="ph" 
                  name="pH"
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  dot={<CustomDot />}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  yAxisId="right_tds"
                  type="monotone" 
                  dataKey="tds" 
                  name="TDS (ppm)"
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={<CustomDot />}
                  activeDot={{ r: 6 }}
                />
                <Brush 
                  dataKey="displayTime" 
                  height={30} 
                  stroke={brushStroke}
                  fill={brushFill}
                  tickFormatter={() => ""}
                  travellerWidth={10}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;