const ReferenceModel = require('../models/referenceModel');

exports.getDrivers = async (req, res) => {
  try {
    const drivers = await ReferenceModel.getAll("drivers");
    res.json(drivers);
  } catch (err) {
    console.error("❌ ERROR FETCHING DRIVERS:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getTrucks = async (req, res) => {
  try {
    const trucks = await ReferenceModel.getAll("trucks");
    res.json(trucks);
  } catch (err) {
    console.error("❌ ERROR FETCHING TRUCKS:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getLocations = async (req, res) => {
  try {
    const locations = await ReferenceModel.getAll("locations");
    res.json(locations);
  } catch (err) {
    console.error("❌ ERROR FETCHING LOCATIONS:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};