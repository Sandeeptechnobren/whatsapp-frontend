"use client";

import React from "react";
import CreateInstance from "../components/instancesConponent/createInstance";
import InstancesList from "../components/instancesConponent/instancesList";

export default function InstancesPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-6 p-6 bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* Left Pane — Create Instance */}
      <div className="w-full lg:w-1/3 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-800 transition-all duration-300">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span className="text-purple-600 dark:text-purple-400">+</span> Create Instance
        </h2>
        <CreateInstance />
      </div>

      {/* Right Pane — Instance List */}
      <div className="flex-1 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-800 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Active Instances
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Manage your running instances
          </span>
        </div>
        <InstancesList />
      </div>
    </div>
  );
}
