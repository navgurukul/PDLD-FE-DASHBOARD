import React from "react";
import { Link } from "react-router-dom";

const LegalTerms = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Simplified version */}
      <div className="w-[165px] bg-[#1e3a39] flex-shrink-0">
        <div className="p-4">
          <img src="/path-to-your-logo.png" alt="Logo" className="w-12 h-12" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top navigation bar */}
        <div className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Link to="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <span className="text-gray-400 mx-1">›</span>
            <span className="text-gray-700">Privacy Policy</span>
          </div>
          <div>
            {/* If you have any right-side elements */}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 max-w-4xl mx-auto">
          <h1 className="text-2xl font-medium text-[#1e3a39] mb-6">Privacy Policy</h1>
          
          <div className="bg-white p-6 rounded-md shadow-sm">
            <p className="mb-4">Thank you for choosing our mobile app. Your privacy is of utmost importance to us. This policy outlines what information we collect, how we use it, and how we protect it.</p>
            
            <h2 className="text-xl font-medium text-[#1e3a39] mt-6 mb-3">1. What We Collect</h2>
            <div className="mb-4">
              <p className="font-medium mb-1">Student & Health Data:</p>
              <p className="ml-1 text-gray-700">We collect data you enter (like student scores or health details) to help teachers and school staff manage student progress.</p>
            </div>
            
            <div className="mb-4">
              <p className="font-medium mb-1">Device Info:</p>
              <p className="ml-1 text-gray-700">We may collect basic app usage and device information (like app version or Android version) to improve the app.</p>
            </div>
            
            <div className="mb-4">
              <p className="font-medium mb-1">No Sensitive Data:</p>
              <p className="ml-1 text-gray-700">We don't collect personal contact info (like your phone number or email) unless needed for login or support.</p>
            </div>
            
            <h2 className="text-xl font-medium text-[#1e3a39] mt-6 mb-3">2. How We Use Your Data</h2>
            <p className="mb-2">Your data is utilized to:</p>
            <ul className="list-disc ml-6 mb-4 text-gray-700">
              <li className="mb-1">Monitor and improve student progress.</li>
              <li className="mb-1">Enhance overall app functionality.</li>
              <li className="mb-1">Synchronize offline data when connectivity is restored.</li>
            </ul>
            
            <h2 className="text-xl font-medium text-[#1e3a39] mt-6 mb-3">3. Data Access</h2>
            <ul className="list-disc ml-6 mb-4 text-gray-700">
              <li className="mb-1">Your data is <span className="font-medium">never sold or shared</span> with third parties.</li>
              <li className="mb-1">Only authorized personnel (e.g., school administrators) have access to data for reporting and administrative purposes.</li>
            </ul>
            
            <h2 className="text-xl font-medium text-[#1e3a39] mt-6 mb-3">4. Data Security</h2>
            <ul className="list-disc ml-6 mb-4 text-gray-700">
              <li className="mb-1">We employ robust security measures to safeguard your information.</li>
              <li className="mb-1">You have control over your data and can manage it by updating or deleting as needed.</li>
            </ul>
            
            <h2 className="text-xl font-medium text-[#1e3a39] mt-6 mb-3">5. Children's Privacy</h2>
            <p className="mb-4 text-gray-700">This app is intended for use by teachers and school staff, not children.</p>
            
            <h2 className="text-xl font-medium text-[#1e3a39] mt-6 mb-3">6. Contact Us</h2>
            <p className="mb-4 text-gray-700">If you have any questions or concerns regarding our privacy practices, please contact us at: <span className="font-medium">pdld@support.org</span></p>
          </div>
          
          {/* Optional: Add a button to go back to login */}
          {/* <div className="mt-6 flex justify-center">
            <Link 
              to="/login" 
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 py-2 px-6 rounded-md font-medium transition duration-150"
            >
              Back to Login
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LegalTerms;