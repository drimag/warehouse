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
  getWaybillsForScan: () =>
    fetch(`${BASE_URL}/waybills/scanning`).then(handleResponse),
  getWaybillInfo: (id) =>
    fetch(`${BASE_URL}/waybills/${id}`).then(handleResponse),

  startLoading: (id) =>
    fetch(`${BASE_URL}/waybills/loading/${id}`).then(handleResponse),
  inStorage: (id) =>
    fetch(`${BASE_URL}/waybills/in_storage/${id}`).then(handleResponse),

  getUnits: () => fetch(`${BASE_URL}/units`).then(handleResponse),
  getUnitHistory: (unitID) =>
    fetch(`${BASE_URL}/units/history/${unitID}`).then(handleResponse),
  findUnitByVin: (scan) =>
    fetch(`${BASE_URL}/units/scan/${scan}`).then(handleResponse),

  getTrucks: () => fetch(`${BASE_URL}/references/trucks`).then(handleResponse),
  getDrivers: () =>
    fetch(`${BASE_URL}/references/drivers`).then(handleResponse),
  getLocations: () =>
    fetch(`${BASE_URL}/references/locations`).then(handleResponse),
};
