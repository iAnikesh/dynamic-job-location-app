import { useState } from "react";

export default function Reset() {
  const [form, setForm] = useState({});
const API = import.meta.env.VITE_API_URL;

  const resetPass = async () => {
    const res = await fetch(`${API}/api/auth/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    alert(data.message);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white shadow p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-blue-600 mb-4 text-center">
          Reset Password
        </h2>

        <input
          placeholder="Email"
          className="w-full px-4 py-2 border rounded-md mb-3"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="OTP"
          className="w-full px-4 py-2 border rounded-md mb-3"
          onChange={(e) => setForm({ ...form, otp: e.target.value })}
        />

        <input
          type="password"
          placeholder="New Password"
          className="w-full px-4 py-2 border rounded-md"
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />

        <button
          onClick={resetPass}
          className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
}