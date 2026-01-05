import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertCircle, Lock } from 'lucide-react';
import { getRanges, updateRanges, getFuzzyRules, updateFuzzyRules, getCalibrations, updateCalibrations } from '../services/api';
import { RangeDefinition, FuzzyRule, CalibrationData } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { isAuthenticated, openLoginModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'ranges' | 'rules' | 'calibrations'>('ranges');
  const [ranges, setRanges] = useState<RangeDefinition[]>([]);
  const [rules, setRules] = useState<FuzzyRule[]>([]);
  const [calibrations, setCalibrations] = useState<CalibrationData>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Auto-dismiss success notifications after 3 seconds
  useEffect(() => {
    if (notification && notification.type === 'success') {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadData = async () => {
    setLoading(true);
    setNotification(null);
    try {
      if (activeTab === 'ranges') {
        const data = await getRanges();
        setRanges(data);
      } else if (activeTab === 'rules') {
        const data = await getFuzzyRules();
        setRules(data);
      } else if (activeTab === 'calibrations') {
        const data = await getCalibrations();
        setCalibrations(data);
      }
    } catch (error) {
      setNotification({ msg: "Failed to load data", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return false;
    }
    return true;
  };

  const handleSaveRanges = async () => {
    if (!checkAuth()) return;
    setSaving(true);
    try {
      await updateRanges(ranges);
      await loadData(); // Reload data to confirm save
      setNotification({ msg: "Ranges updated successfully", type: 'success' });
    } catch (error) {
      setNotification({ msg: "Failed to update ranges", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRules = async () => {
    if (!checkAuth()) return;
    setSaving(true);
    try {
      await updateFuzzyRules(rules);
      await loadData(); // Reload data to confirm save
      setNotification({ msg: "Fuzzy rules updated successfully", type: 'success' });
    } catch (error) {
      setNotification({ msg: "Failed to update rules", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCalibrations = async () => {
    if (!checkAuth()) return;
    setSaving(true);
    try {
      if (calibrations.length > 0) {
        await updateCalibrations(calibrations);
        // Add a delay to ensure Google Sheet has time to process before reload
        await new Promise(r => setTimeout(r, 2000));
        await loadData();
        setNotification({ msg: "Calibrations updated successfully", type: 'success' });
      }
    } catch (error) {
      setNotification({ msg: "Failed to update calibrations", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleRangeChange = (index: number, field: keyof RangeDefinition, value: string | number) => {
    const newRanges = [...ranges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    setRanges(newRanges);
  };

  const handleRuleChange = (index: number, field: keyof FuzzyRule, value: string | number) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  const handleCalibrationChange = (key: string, newValue: string) => {
    setCalibrations(prev => prev.map(item => 
      item.key === key ? { ...item, value: newValue } : item
    ));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">System Configuration</h1>
        {notification && (
          <div className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-300 ${notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'}`}>
            <AlertCircle className="w-4 h-4" />
            {notification.msg}
          </div>
        )}
      </div>

      <div className="flex space-x-1 bg-white dark:bg-slate-800 p-1 rounded-xl w-fit border border-slate-200 dark:border-slate-700 transition-colors">
        {(['ranges', 'rules', 'calibrations'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab 
              ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg transition-colors duration-300 relative">
        {!isAuthenticated && (
           <div className="bg-amber-100 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-6 py-2 text-xs font-medium text-amber-800 dark:text-amber-200 flex items-center gap-2">
             <Lock className="w-3 h-3" />
             Read-only mode. Login to save changes.
           </div>
        )}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-10 text-slate-500">
               <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'ranges' && (
                <div>
                   <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-sm">
                          <th className="p-3">Variable</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Min</th>
                          <th className="p-3">Max</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {ranges.map((range, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{range.Variabel}</td>
                            <td className="p-3">
                                <input 
                                  value={range.Kategori} 
                                  readOnly={!isAuthenticated}
                                  onChange={(e) => handleRangeChange(idx, 'Kategori', e.target.value)}
                                  className="bg-transparent border border-slate-300 dark:border-slate-700 focus:border-cyan-500 rounded px-2 py-1 text-slate-800 dark:text-slate-200 w-full transition-colors"
                                />
                            </td>
                            <td className="p-3">
                                <input 
                                  type="number"
                                  value={range.Min} 
                                  readOnly={!isAuthenticated}
                                  onChange={(e) => handleRangeChange(idx, 'Min', Number(e.target.value))}
                                  className="bg-transparent border border-slate-300 dark:border-slate-700 focus:border-cyan-500 rounded px-2 py-1 text-slate-800 dark:text-slate-200 w-24 transition-colors"
                                />
                            </td>
                            <td className="p-3">
                                <input 
                                  type="number"
                                  value={range.Max} 
                                  readOnly={!isAuthenticated}
                                  onChange={(e) => handleRangeChange(idx, 'Max', Number(e.target.value))}
                                  className="bg-transparent border border-slate-300 dark:border-slate-700 focus:border-cyan-500 rounded px-2 py-1 text-slate-800 dark:text-slate-200 w-24 transition-colors"
                                />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={handleSaveRanges} 
                      disabled={saving}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${isAuthenticated ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : isAuthenticated ? <Save className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'rules' && (
                <div>
                   <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-sm">
                          <th className="p-3">ID</th>
                          <th className="p-3">Temp</th>
                          <th className="p-3">pH</th>
                          <th className="p-3">TDS</th>
                          <th className="p-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {rules.map((rule, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-3 text-slate-500">{rule.RuleID}</td>
                            <td className="p-3">
                                <input 
                                  value={rule.Suhu} 
                                  readOnly={!isAuthenticated}
                                  onChange={(e) => handleRuleChange(idx, 'Suhu', e.target.value)}
                                  className="bg-transparent border border-slate-300 dark:border-slate-700 focus:border-cyan-500 rounded px-2 py-1 text-slate-800 dark:text-slate-200 w-20 transition-colors"
                                />
                            </td>
                            <td className="p-3">
                                <input 
                                  value={rule.pH} 
                                  readOnly={!isAuthenticated}
                                  onChange={(e) => handleRuleChange(idx, 'pH', e.target.value)}
                                  className="bg-transparent border border-slate-300 dark:border-slate-700 focus:border-cyan-500 rounded px-2 py-1 text-slate-800 dark:text-slate-200 w-20 transition-colors"
                                />
                            </td>
                            <td className="p-3">
                                <input 
                                  value={rule.TDS} 
                                  readOnly={!isAuthenticated}
                                  onChange={(e) => handleRuleChange(idx, 'TDS', e.target.value)}
                                  className="bg-transparent border border-slate-300 dark:border-slate-700 focus:border-cyan-500 rounded px-2 py-1 text-slate-800 dark:text-slate-200 w-20 transition-colors"
                                />
                            </td>
                            <td className="p-3">
                                <input 
                                  value={rule['Aksi Direkomendasikan']} 
                                  readOnly={!isAuthenticated}
                                  onChange={(e) => handleRuleChange(idx, 'Aksi Direkomendasikan', e.target.value)}
                                  className="bg-transparent border border-slate-300 dark:border-slate-700 focus:border-cyan-500 rounded px-2 py-1 text-slate-800 dark:text-slate-200 w-full transition-colors"
                                />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={handleSaveRules} 
                      disabled={saving}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${isAuthenticated ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : isAuthenticated ? <Save className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      Save Rules
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'calibrations' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {calibrations && calibrations.map((item, index) => (
                      <div key={item.key || index} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                        <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">{item.key.replace(/_/g, ' ')}</label>
                        <input
                            type="text"
                            value={item.value}
                            readOnly={!isAuthenticated}
                            onChange={(e) => handleCalibrationChange(item.key, e.target.value)}
                             className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-cyan-600 dark:text-cyan-400 font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                        {item.description && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">{item.description}</p>
                        )}
                      </div>
                    ))}
                    {calibrations.length === 0 && <div className="text-slate-500 col-span-full">No calibration data found.</div>}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={handleSaveCalibrations} 
                      disabled={saving}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${isAuthenticated ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : isAuthenticated ? <Save className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      Save Calibrations
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;