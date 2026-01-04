import { RealtimeData, HistoryItem, HistoryPeriod, RangeDefinition, FuzzyRule, CalibrationData } from '../types';

const API_URL = "https://script.google.com/macros/s/AKfycbzonNEYsPMDwDkCAT7yxSDQMmwbciWvD4SDS5GMg2KB3JBH64ynfy5RK2I-EpFAHM-cRg/exec";

// Helper for GET requests
const fetchGet = async <T>(action: string, params: Record<string, string | number> = {}): Promise<T> => {
  const url = new URL(API_URL);
  url.searchParams.append('action', action);
  Object.keys(params).forEach(key => url.searchParams.append(key, String(params[key])));
  
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
  // Google Apps Script requires text/plain for CORS-free JSON parsing in simple web apps usually,
  // or a specific setup. The provided script uses JSON.parse(e.postData.contents).
  // Using 'no-cors' mode would hide the response, but we need the response.
  // Standard fetch with stringified body usually works if script handles OPTIONS or simple POST.
  
  const response = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    // We intentionally avoid setting Content-Type to application/json to avoid preflight OPTIONS
    // if the server doesn't support it well. Text/plain is "simple request".
    headers: {
      'Content-Type': 'text/plain;charset=utf-8', 
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
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
  // Construct a full date string because the backend does `new Date(params.timer...)`
  // We use today's date + the time provided
  const now = new Date();
  const [hours, minutes] = timeString.split(':');
  now.setHours(parseInt(hours), parseInt(minutes), 0);
  
  return fetchPost({
    action: 'setStatus',
    [timerKey]: now.toISOString()
  });
};

export const getRanges = () => fetchGet<RangeDefinition[]>('getRangeDefinitions');
export const updateRanges = (data: RangeDefinition[]) => fetchPost({ action: 'updateRangeDefinitions', data });

export const getFuzzyRules = () => fetchGet<FuzzyRule[]>('getFuzzyRules');
export const updateFuzzyRules = (data: FuzzyRule[]) => fetchPost({ action: 'updateFuzzyRules', data });

export const getCalibrations = () => fetchGet<CalibrationData>('getCalibration');
export const updateCalibrations = (data: CalibrationData) => fetchPost({ action: 'updateCalibration', data });