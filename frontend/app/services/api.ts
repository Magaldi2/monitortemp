import axios from 'axios';

const API_ROOT = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'; // <-- Trocar o IP aqui

export const fetchLatestTemperature = (deviceId: string) =>
  axios.get(`${API_ROOT}/api/${deviceId}/temperature/latest/`);

export const fetchTemperatureHistory = (deviceId: string, limit = 20) =>
  axios.get(`${API_ROOT}/api/${deviceId}/temperature/`, {
    params: { limit }
  });
  
export const fetchDevices = () =>
  axios.get<string[]>(`${API_ROOT}/api/devices/`);
