// src/pages/RecruiterDashboard.jsx
import React from "react";
export default function RecruiterDashboard() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Recruiter Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">Active job posts</div>
        <div className="p-4 bg-white rounded shadow">Applicants</div>
        <div className="p-4 bg-white rounded shadow">Analytics</div>
      </div>
    </div>
  );
}