const Property = require("../models/Property");
const catchAsync = require("../utils/catchAsync");

// GET /api/wishlist - the saved properties of the logged-in user
const getWishlist = catchAsync(async (req, res) => {
  // populate = "replace each saved id with the real property document" (like a join)
  const user = await req.user.populate({ path: "wishlist", select: "-ownershipDoc" });
  const properties = user.wishlist.filter(Boolean); // drop any property that was deleted
  res.json({ properties, ids: properties.map((p) => String(p._id)) });
});

// POST /api/wishlist/:propertyId - toggle: save if not saved, remove if saved
const toggleWishlist = catchAsync(async (req, res) => {
  const property = await Property.findById(req.params.propertyId);
  if (!property) return res.status(404).json({ message: "Property not found" });

  const user = req.user;
  const index = user.wishlist.findIndex((id) => String(id) === String(property._id));
  let saved;
  if (index === -1) {
    user.wishlist.push(property._id);
    saved = true;
  } else {
    user.wishlist.splice(index, 1);
    saved = false;
  }
  await user.save();

  res.json({ saved, ids: user.wishlist.map(String) });
});

module.exports = { getWishlist, toggleWishlist };
