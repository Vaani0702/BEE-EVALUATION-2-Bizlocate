import { API } from "./api";

// Photos saved by Multer come back as "/uploads/photos/123.jpg" -> add the backend address.
// Seed data uses full web URLs, which are used as they are.
export function imageUrl(path) {
  if (!path) return "";
  return path.startsWith("/uploads") ? API + path : path;
}

export const initials = (name = "") =>
  name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

export const inr = (n) => Number(n || 0).toLocaleString("en-IN");

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const TYPE_LABELS = {
  manufacturing: "Heavy Manufacturing",
  logistics: "Logistics & Distribution",
  warehousing: "Cold Storage / Warehousing",
  rd: "R&D / Flex Space"
};

// calculateMatch -> 4 simple factors, each worth 25 points (same logic as the original site).
// Returns null when the business has not saved a requirement yet.
export function calculateMatch(property, requirement) {
  if (!requirement) return null;
  let score = 0;

  if (!requirement.sqft || property.area >= requirement.sqft) score += 25;
  if (!requirement.budget || property.rent <= requirement.budget) score += 25;
  if (!requirement.power || property.power >= requirement.power) score += 25;
  if (!requirement.location || property.location.toLowerCase().includes(requirement.location.toLowerCase())) score += 25;

  return score;
}
