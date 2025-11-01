import React from "react";

export default function UnderDevelopment({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Animated spinner */}
      <div className="w-16 h-16 mb-5 flex items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="5" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-purple-600 mb-2">Page Under Development</h2>
      <p className="text-gray-700 text-center">{message || "This feature will be available soon. Stay tuned!"}</p>
    </div>
  );
}
