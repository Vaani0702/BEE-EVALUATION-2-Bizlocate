const Requirement = require("../models/Requirement");
const catchAsync = require("../utils/catchAsync");

// GET /api/requirement - my saved requirement (or null)
const getMine = catchAsync(async (req, res) => {
  const requirement = await Requirement.findOne({ user: req.user._id });
  res.json({ requirement });
});

// PUT /api/requirement - save (create the first time, update after that)
const saveMine = catchAsync(async (req, res) => {
  const b = req.body;
  const data = {
    businessType: b.businessType || "",
    sqft: Number(b.sqft) || 0,
    power: Number(b.power) || 0,
    budget: Number(b.budget) || 0,
    location: b.location || "",
    truckAccess: b.truckAccess !== false && b.truckAccess !== "no"
  };

  // "upsert" = update if it exists, otherwise insert.
  const requirement = await Requirement.findOneAndUpdate(
    { user: req.user._id },
    { $set: data },
    { new: true, upsert: true }
  );
  res.json({ requirement });
});

module.exports = { getMine, saveMine };
