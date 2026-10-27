// Run with:  npm run seed
// Fills the database with demo users and the 6 original BizLocate listings.
// WARNING: it first empties the users, properties, enquiries, requirements and share-request collections.
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Property = require("./models/Property");
const Enquiry = require("./models/Enquiry");
const Requirement = require("./models/Requirement");
const ShareRequest = require("./models/ShareRequest");
const seedProperties = require("./data/seedProperties.json");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/bizlocate");

  // deleteMany({}) = delete every document in the collection (same as db.users.deleteMany({}) in the shell)
  await Promise.all([
    User.deleteMany({}), Property.deleteMany({}), Enquiry.deleteMany({}),
    Requirement.deleteMany({}), ShareRequest.deleteMany({})
  ]);

  // create() runs the pre-save hook, so these passwords get hashed too.
  const admin = await User.create({ name: "BizLocate Admin", email: "admin@bizlocate.com", password: "admin123", role: "admin" });
  const owner1 = await User.create({ name: "Industrial Brokers India", email: "owner1@bizlocate.com", password: "owner123", role: "owner" });
  const owner2 = await User.create({ name: "Talegaon Estates", email: "owner2@bizlocate.com", password: "owner123", role: "owner" });
  await User.create({ name: "Demo Business", email: "business@bizlocate.com", password: "business123", role: "business" });

  const owners = { "seed-owner-1": owner1, "seed-owner-2": owner2 };

  for (const [index, item] of seedProperties.entries()) {
    const { ownerKey, ...fields } = item;
    const owner = owners[ownerKey];
    await Property.create({
      ...fields,
      owner: owner._id,
      ownerName: owner.name,
      shareholders: [{ user: owner._id, name: owner.name, percent: 100, isAdmin: true }],
      // 5th listing stays "pending" so the admin queue is not empty on the first demo.
      verification: index === 4 ? "pending" : "verified",
      views: 10 + index * 7
    });
  }

  console.log("Seed done:");
  console.log("  admin    admin@bizlocate.com    / admin123");
  console.log("  owner    owner1@bizlocate.com   / owner123");
  console.log("  owner    owner2@bizlocate.com   / owner123");
  console.log("  business business@bizlocate.com / business123");
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
