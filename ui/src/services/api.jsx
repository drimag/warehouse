const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || "Network response was not ok");
  }
  return response.json();
};

export const api = {
  // GET all waybills
  getWaybills: () => fetch(`${BASE_URL}/waybills`).then(handleResponse),
  getWaybillInfo: (id) => fetch(`${BASE_URL}/waybills/waybillInfo/${id}`).then(handleResponse),

  // GET a single waybill by ID (for the Detail View later)
  //   getWaybillById: (id) => fetch(`${BASE_URL}/waybills/${id}`).then(handleResponse),
};
