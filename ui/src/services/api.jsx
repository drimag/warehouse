const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || "Network response was not ok");
  }
  return response.json();
};

export const api = {
  getWaybills: () => fetch(`${BASE_URL}/waybills`).then(handleResponse),
  getWaybillsForScan: () => fetch(`${BASE_URL}/waybills/scanning`).then(handleResponse),
  getWaybillInfo: (id) => fetch(`${BASE_URL}/waybills/${id}`).then(handleResponse),
  getUnits: () => fetch(`${BASE_URL}/units`).then(handleResponse),
  getUnitHistory: (unitID) => fetch(`${BASE_URL}/units/${unitID}`).then(handleResponse)
};
