"use client";

import React from "react";

export default function DocumentsPage() {
  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded-xl shadow-md p-8">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">
        Documents
      </h1>
      <p className="text-gray-700 mb-6">
        This page will list user guides, API documentation, agreements, or any helpful documents related to your system.
      </p>
      <div className="border border-gray-200 rounded-lg px-6 py-8 text-center bg-gray-50">
        <span className="text-lg text-gray-600">No documents uploaded yet.</span>
      </div>
    </div>
  );
}
