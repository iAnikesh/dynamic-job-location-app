import { useState } from "react";

export default function Forgot() {
  const [email, setEmail] = useState("");
const API = import.meta.env.VITE_API_URL;

  const sendOtp = async () => {
    const res = await fetch(`${API}/api/auth/forgot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    alert(data.message);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white shadow p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-blue-600 mb-4 text-center">
          Forgot Password
        </h2>
        <input
          placeholder="Email"
          className="w-full px-4 py-2 border rounded-md"
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={sendOtp}
          className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md"
        >
          Send OTP
        </button>
      </div>
    </div>
  );
}