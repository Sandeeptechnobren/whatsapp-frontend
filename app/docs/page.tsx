"use client";

import React from "react";
import UnderDevelopment from "../components/UnderDevelopment";

export default function DocumentsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg p-8 sm:p-10 transition-all duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            📄 Documents
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
            Access documentation, guides, and API references here.
          </p>
        </div>

        <div className="bg-gray-100 dark:bg-[#121212] rounded-xl p-6 flex items-center justify-center border border-gray-200 dark:border-gray-800">
          <UnderDevelopment message="This section is under development. You'll soon find guides, API docs, and resources here!" />
        </div>
      </div>
    </div>
  );
}
