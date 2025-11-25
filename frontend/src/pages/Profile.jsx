// src/pages/Profile.jsx
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user } = useContext(AuthContext);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* left: profile card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 text-2xl">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="text-lg font-semibold">{user?.name || user?.email}</div>
              <div className="text-sm text-gray-500">{user?.role}</div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="text-sm text-gray-600">Email</div>
            <div className="font-medium">{user?.email}</div>

            <div className="text-sm text-gray-600 mt-4">Selected Job Location</div>
            <div className="font-medium text-sky-600">No location selected</div>
          </div>
        </div>

        {/* middle: stats / recent projects */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-500">Membership</div>
              <div className="text-lg font-semibold">Free</div>
            </div>
            <button className="px-4 py-2 bg-sky-600 text-white rounded">Manage</button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Project History</h3>
              <button className="text-sm text-sky-600">View all</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                <div className="text-sm text-gray-500">Project</div>
                <div className="font-medium">Soil Moisture IoT</div>
                <div className="text-xs text-gray-400 mt-1">Updated 2 weeks ago</div>
              </div>

              <div className="p-4 border rounded">
                <div className="text-sm text-gray-500">Project</div>
                <div className="font-medium">Travel Safety Bot</div>
                <div className="text-xs text-gray-400 mt-1">Updated 1 month ago</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Financial Dashboard</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                <div className="text-sm text-gray-500">Earnings</div>
                <div className="text-xl font-semibold">₹0</div>
              </div>
              <div className="p-4 border rounded">
                <div className="text-sm text-gray-500">Spent</div>
                <div className="text-xl font-semibold">₹0</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}