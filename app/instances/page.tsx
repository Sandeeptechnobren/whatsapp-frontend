"use client";

import React, { useEffect, useState } from "react";
import CreateInstancePage from "./createinstance/page";
import InstancesList from "./instanceslist/page";

export default function InstancesPage() {
  const [listKey, setListKey] = useState(0);

  useEffect(() => {
    const refresh = () => setListKey(k => k + 1);
    window.addEventListener("instance-created", refresh);
    return () => window.removeEventListener("instance-created", refresh);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Instances</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your WhatsApp connections — each instance is one phone number.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Pane - Create Instance */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">+</span>
                New Instance
              </h2>
              <CreateInstancePage />
            </div>
          </div>

          {/* Right Pane - Instances List */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Your Instances
              </h2>
              <InstancesList key={listKey} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
