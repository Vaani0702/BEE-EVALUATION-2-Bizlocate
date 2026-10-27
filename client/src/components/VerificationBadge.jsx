// Small label showing the admin's verdict on a listing.
export default function VerificationBadge({ status }) {
  if (status === "verified") {
    return <span className="badge badge-verified"><span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span> Verified</span>;
  }
  if (status === "rejected") {
    return <span className="badge badge-rejected"><span className="material-symbols-outlined text-[14px]">cancel</span> Rejected</span>;
  }
  return <span className="badge badge-pending"><span className="material-symbols-outlined text-[14px]">schedule</span> Pending review</span>;
}
