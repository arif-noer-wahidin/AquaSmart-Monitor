import { RealtimeData, HistoryItem, HistoryPeriod, RangeDefinition, FuzzyRule, CalibrationData, CalibrationItem } from '../types';

const API_URL = "https://script.google.com/macros/s/AKfycbzonNEYsPMDwDkCAT7yxSDQMmwbciWvD4SDS5GMg2KB3JBH64ynfy5RK2I-EpFAHM-cRg/exec";

// Helper for GET requests
const fetchGet = async <T>(action: string, params: Record<string, string | number> = {}): Promise<T> => {
  const url = new URL(API_URL);
  url.searchParams.append('action', action);
  Object.keys(params).forEach(key => url.searchParams.append(key, String(params[key])));
  url.searchParams.append('_', new Date().getTime().toString()); // Cache buster to prevent stale data
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    redirect: 'follow'
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
};

// Helper for POST requests
const fetchPost = async (payload: any) => {
  // We utilize URLSearchParams to send data as 'application/x-www-form-urlencoded'.
  // This is the most robust method for Google Apps Script doPost(e) handler
  // as it automatically populates e.parameter, bypassing complex JSON parsing issues.
  const formData = new URLSearchParams();

  Object.keys(payload).forEach(key => {
    const value = payload[key];
    // If the value is an object or array (like our 'data' payload), stringify it.
    // The GAS backend script is already set up to parse these JSON strings inside handleUpdate*.
    if (typeof value === 'object' && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  const response = await fetch(API_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  const result = await response.json();
  
  if (result.status === 'error') {
    throw new Error(result.message || 'Unknown error from server');
  }

  return result;
};

export const getRealtimeData = () => fetchGet<RealtimeData>('realtime');

export const getHistoryData = (period: HistoryPeriod) => {
  const actionMap = {
    '1hour': 'history1hour',
    '1day': 'history1day',
    '1week': 'history1week'
  };
  return fetchGet<HistoryItem[]>(actionMap[period]);
};

export const setRelayStatus = (relay: 'relay1' | 'relay2', status: boolean) => {
  return fetchPost({
    action: 'setStatus',
    [relay]: status ? 'on' : 'off'
  });
};

export const setTimer = (timerKey: 'timer1On' | 'timer1Off' | 'timer2On' | 'timer2Off', timeString: string) => {
  if (!timeString) return Promise.resolve({ status: 'skipped' });
  
  // Construct a full date string because the backend does `new Date(params.timer...)`
  // We use today's date + the time provided
  const now = new Date();
  const [hours, minutes] = timeString.split(':');
  
  if (hours !== undefined && minutes !== undefined) {
      now.setHours(parseInt(hours), parseInt(minutes), 0);
  }
  
  return fetchPost({
    action: 'setStatus',
    [timerKey]: now.toISOString()
  });
};

export const getRanges = () => fetchGet<RangeDefinition[]>('getRangeDefinitions');
export const updateRanges = (data: RangeDefinition[]) => fetchPost({ action: 'updateRangeDefinitions', data: data });

export const getFuzzyRules = () => fetchGet<FuzzyRule[]>('getFuzzyRules');
export const updateFuzzyRules = (data: FuzzyRule[]) => fetchPost({ action: 'updateFuzzyRules', data: data });

export const getCalibrations = async (): Promise<CalibrationData> => {
  // GAS returns 2D array: [['Key', 'Value', 'Desc'], ...]
  const rawData = await fetchGet<any[][]>('getCalibrations');
  
  if (!Array.isArray(rawData)) return [];

  // Transform to objects for frontend use
  return rawData.map(row => ({
    key: String(row[0]),
    value: String(row[1]),
    description: String(row[2] || '')
  }));
};

export const updateCalibrations = (data: CalibrationData) => {
  // Transform objects back to 2D array for GAS: [['Key', 'Value', 'Desc']]
  const payload = data.map(item => [item.key, item.value, item.description]);
  
  // Use plural 'updateCalibrations' to match GAS switch case
  return fetchPost({ action: 'updateCalibrations', data: payload });
};