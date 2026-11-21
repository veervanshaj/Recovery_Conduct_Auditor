import axios from 'axios';

const API_BASE = '/api';

export const api = {
  // Health & System
  getHealth: () => axios.get(`${API_BASE}/health`).then(res => res.data),
  
  // Dashboard
  getDashboardMetrics: () => axios.get(`${API_BASE}/dashboard/metrics`).then(res => res.data),

  // Calls
  getCalls: (params) => axios.get(`${API_BASE}/calls`, { params }).then(res => res.data),
  getCallById: (id) => axios.get(`${API_BASE}/calls/${id}`).then(res => res.data),
  uploadAudio: (formData, onProgress) => axios.post(`${API_BASE}/calls/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
    timeout: 300000 // 5 mins
  }).then(res => res.data),
  submitReview: (id, payload) => axios.post(`${API_BASE}/calls/${id}/review`, payload).then(res => res.data),
  getCallReport: (id) => axios.get(`${API_BASE}/calls/${id}/report`).then(res => res.data),

  // Call Logs (CSV)
  uploadCallLogsCSV: (formData) => axios.post(`${API_BASE}/call-logs/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data),
  getCallLogs: (params) => axios.get(`${API_BASE}/call-logs`, { params }).then(res => res.data),

  // Compliance Rules
  getRules: () => axios.get(`${API_BASE}/rules`).then(res => res.data),
  updateRule: (id, payload) => axios.put(`${API_BASE}/rules/${id}`, payload).then(res => res.data),

  // Demo
  seedDemoData: () => axios.post(`${API_BASE}/demo/seed`).then(res => res.data)
};
