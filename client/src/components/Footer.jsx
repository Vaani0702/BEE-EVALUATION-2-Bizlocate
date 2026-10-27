import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-blue-950 w-full mt-auto border-t border-blue-900">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-white">
        <div>
          <div className="mb-4"><Logo light /></div>
          <p className="text-sm text-blue-200">Your trusted partner in finding premium industrial real estate across India.</p>
        </div>
        <div>
          <h4 className="text-xs uppercase text-blue-300 font-bold mb-4 tracking-wider">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="text-blue-200">About Us</span></li>
            <li><span className="text-blue-200">Contact Broker</span></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase text-blue-300 font-bold mb-4 tracking-wider">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="text-blue-200">Privacy Policy</span></li>
            <li><span className="text-blue-200">Terms of Service</span></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase text-blue-300 font-bold mb-4 tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link className="text-blue-200 hover:text-white transition-colors" to="/owner-form">List Property</Link></li>
            <li><Link className="text-blue-200 hover:text-white transition-colors" to="/listings">Browse Listings</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-blue-900 text-center py-6">
        <p className="text-xs text-blue-300">© 2024 BizLocate Industrial. All rights reserved.</p>
      </div>
    </footer>
  );
}
