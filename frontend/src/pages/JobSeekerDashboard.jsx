// src/pages/JobSeekerDashboard.jsx
import React from "react";
export default function JobSeekerDashboard() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Jobseeker Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">Recommended jobs</div>
        <div className="p-4 bg-white rounded shadow">Your Applications</div>
        <div className="p-4 bg-white rounded shadow">Saved Jobs</div>
      </div>
    </div>
  );
}