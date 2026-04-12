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
  getWaybillInfoById: (id) =>
    fetch(`${BASE_URL}/waybills/display/${id}`).then(handleResponse),
  saveWaybillForm: async (details) => {
    const response = await fetch(`${BASE_URL}/waybills/save_form`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details),
    });
    return handleResponse(response);
  },

  startLoading: (id) =>
    fetch(`${BASE_URL}/waybills/loading/${id}`).then(handleResponse),
  setAdvice: (id) =>
    fetch(`${BASE_URL}/waybills/advice/${id}`).then(handleResponse),
  setInTransit: (id) =>
    fetch(`${BASE_URL}/waybills/in_transit/${id}`).then(handleResponse),
  setArrived: (id) =>
    fetch(`${BASE_URL}/waybills/arrived/${id}`).then(handleResponse),

  getUnits: () => fetch(`${BASE_URL}/units`).then(handleResponse),
  getUnitHistory: (unitID) =>
    fetch(`${BASE_URL}/units/history/${unitID}`).then(handleResponse),
  scanUnitByVin: (scan) =>
    fetch(`${BASE_URL}/units/scan/${scan}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(handleResponse),
  scanNewUnit: (scan) =>
    fetch(`${BASE_URL}/units/new_scan/${scan}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(handleResponse),
  setUnitInTransit: (scan) =>
    fetch(`${BASE_URL}/units/in_transit/${scan}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(handleResponse),

  getTrucks: () => fetch(`${BASE_URL}/references/trucks`).then(handleResponse),
  getDrivers: () =>
    fetch(`${BASE_URL}/references/drivers`).then(handleResponse),
  getLocations: () =>
    fetch(`${BASE_URL}/references/locations`).then(handleResponse),

  createManifest: (waybillId, unitId, type, userId) =>
    fetch(
      `${BASE_URL}/manifest/waybill/${waybillId}/unit/${unitId}/type/${type}/user/${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    ).then(handleResponse),
};
