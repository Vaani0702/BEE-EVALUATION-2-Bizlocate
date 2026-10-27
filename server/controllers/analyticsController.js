const Property = require("../models/Property");
const Enquiry = require("../models/Enquiry");
const catchAsync = require("../utils/catchAsync");

// GET /api/analytics/me
// For every property I own a share of: views, enquiries received and my monthly rent share.
const myAnalytics = catchAsync(async (req, res) => {
  const properties = await Property.find({ "shareholders.user": req.user._id });

  const rows = [];
  for (const p of properties) {
    const enquiries = await Enquiry.countDocuments({ property: p._id });
    const mine = p.shareholders.find((s) => String(s.user) === String(req.user._id));
    const monthlyRent = p.rent * p.area;

    rows.push({
      id: p._id,
      title: p.title,
      verification: p.verification,
      views: p.views,
      enquiries,
      myPercent: mine.percent,
      monthlyRent,
      earnings: Math.round((monthlyRent * mine.percent) / 100) // my share per month
    });
  }

  const totals = {
    properties: rows.length,
    views: rows.reduce((sum, r) => sum + r.views, 0),
    enquiries: rows.reduce((sum, r) => sum + r.enquiries, 0),
    earnings: rows.reduce((sum, r) => sum + r.earnings, 0)
  };

  res.json({ rows, totals });
});

module.exports = { myAnalytics };
