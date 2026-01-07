import { RealtimeData, HistoryItem, HistoryPeriod, RangeDefinition, FuzzyRule, CalibrationData, CalibrationItem } from '../types';

// Now pointing to our own Cloudflare Pages Function proxy
const API_URL = "/api/proxy";

// Helper for GET requests
const fetchGet = async <T>(action: string, params: Record<string, string | number> = {}): Promise<T> => {
  const url = new URL(window.location.origin + API_URL); // Construct absolute URL for local proxy
  url.searchParams.append('action', action);
  Object.keys(params).forEach(key => url.searchParams.append(key, String(params[key])));
  url.searchParams.append('_', new Date().getTime().toString()); // Cache buster
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
};

// Helper for POST requests
const fetchPost = async (payload: any) => {
  // We send JSON to our Cloudflare Proxy. 
  // The Proxy will convert it to form-data for Google Apps Script.
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
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
  const rawData = await fetchGet<any[][]>('getCalibrations');
  if (!Array.isArray(rawData)) return [];

  return rawData.map(row => ({
    key: String(row[0]),
    value: String(row[1]),
    description: String(row[2] || '')
  }));
};

export const updateCalibrations = (data: CalibrationData) => {
  const payload = data.map(item => [item.key, item.value, item.description]);
  return fetchPost({ action: 'updateCalibrations', data: payload });
};