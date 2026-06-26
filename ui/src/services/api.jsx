import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiInstance = axios.create({
  baseURL: BASE_URL,
});

apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.warn(
        "Session expired or invalid token detected. Force logging out.",
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const api = {
  // --- Waybills ---
  getWaybills: () => apiInstance.get("/waybills").then((res) => res.data),

  getWaybillsForScan: () =>
    apiInstance.get("/waybills/scanning").then((res) => res.data),

  getWaybillInfo: (id) =>
    apiInstance.get(`/waybills/${id}`).then((res) => res.data),

  getWaybillInfoById: (id) =>
    apiInstance.get(`/waybills/display/${id}`).then((res) => res.data),

  saveWaybillForm: (details) =>
    apiInstance.post("/waybills/save_form", details).then((res) => res.data),

  startScanning: (id) =>
    apiInstance.patch(`/waybills/start_scan/${id}`).then((res) => res.data),

  cancelScanning: (id) =>
    apiInstance.patch(`/waybills/cancel_scan/${id}`).then((res) => res.data),

  touchLoadingTimeout: (id) =>
    apiInstance
      .patch(`/waybills/loading_timeout/${id}`)
      .then((res) => res.data),

  // --- Units ---
  getUnits: () => apiInstance.get("/units").then((res) => res.data),

  getUnitHistory: (unitID) =>
    apiInstance.get(`/units/history/${unitID}`).then((res) => res.data),

  findUnitByVIN: (scan) =>
    apiInstance.post(`/units/find_unit/${scan}`).then((res) => res.data),

  insertNewUnit: (details) =>
    apiInstance.post("/units/new_unit", details).then((res) => res.data),

  // --- References ---
  getTrucks: () =>
    apiInstance.get("/references/trucks").then((res) => res.data),

  getDrivers: () =>
    apiInstance.get("/references/drivers").then((res) => res.data),

  getLocations: () =>
    apiInstance.get("/references/locations").then((res) => res.data),

  // --- Users ---
  registerUser: (details) =>
    apiInstance.post("/users/register", details).then((res) => res.data),

  // --- Manifests ---
  createManifest: (waybillId, unitId, type, userId) =>
    apiInstance
      .post("/manifest/createNew", {
        waybillId,
        unitId,
        type,
        userId,
      })
      .then((res) => res.data),

  finalizeScan: (details) =>
    apiInstance
      .post("/manifest/finalize_scan", details)
      .then((res) => res.data),

  // --- Bulk Upload ---
  // Axios automatically detects FormData payloads and configures multipart/form-data headers for you!
  uploadSheet: (formData) =>
    apiInstance
      .post("/bulkUpload/generic_sheet", formData)
      .then((res) => res.data),
};
