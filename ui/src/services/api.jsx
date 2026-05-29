import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiInstance = axios.create({
  baseURL: BASE_URL,
});

apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Session expired or invalid token detected. Force logging out.");
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export const api = {
  // --- Waybills ---
  getWaybills: () => 
    apiInstance.get('/waybills').then(res => res.data),
    
  getWaybillsForScan: () =>
    apiInstance.get('/waybills/scanning').then(res => res.data),
    
  getWaybillInfo: (id) =>
    apiInstance.get(`/waybills/${id}`).then(res => res.data),
    
  getWaybillInfoById: (id) =>
    apiInstance.get(`/waybills/display/${id}`).then(res => res.data),
    
  saveWaybillForm: (details) => 
    apiInstance.post('/waybills/save_form', details).then(res => res.data),

  startLoading: (id) =>
    apiInstance.get(`/waybills/loading/${id}`).then(res => res.data),
    
  setAdvice: (id) =>
    apiInstance.get(`/waybills/advice/${id}`).then(res => res.data),
    
  setInTransit: (id) =>
    apiInstance.get(`/waybills/in_transit/${id}`).then(res => res.data),
    
  setArrived: (id) =>
    apiInstance.get(`/waybills/arrived/${id}`).then(res => res.data),

  // --- Units ---
  getUnits: () => 
    apiInstance.get('/units').then(res => res.data),
    
  getUnitHistory: (unitID) =>
    apiInstance.get(`/units/history/${unitID}`).then(res => res.data),
    
  scanUnitByVin: (scan) =>
    apiInstance.post(`/units/scan/${scan}`).then(res => res.data),
    
  scanNewUnit: (scan) =>
    apiInstance.post(`/units/new_scan/${scan}`).then(res => res.data),
    
  setUnitInTransit: (scan) =>
    apiInstance.post(`/units/in_transit/${scan}`).then(res => res.data),
    
  insertNewUnit: (details) =>
    apiInstance.post('/units/new_unit', details).then(res => res.data),

  // --- References ---
  getTrucks: () => 
    apiInstance.get('/references/trucks').then(res => res.data),
    
  getDrivers: () =>
    apiInstance.get('/references/drivers').then(res => res.data),
    
  getLocations: () =>
    apiInstance.get('/references/locations').then(res => res.data),

  // --- Manifests ---
  createManifest: (waybillId, unitId, type, userId) =>
    apiInstance.post(`/manifest/waybill/${waybillId}/unit/${unitId}/type/${type}/user/${userId}`).then(res => res.data),

  // --- Bulk Upload ---
  // Axios automatically detects FormData payloads and configures multipart/form-data headers for you!
  uploadSheet: (formData) =>
    apiInstance.post('/bulkUpload/generic_sheet', formData).then(res => res.data),
};