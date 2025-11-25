import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function LocationModal({ close }) {
  const [location, setLocation] = useState("");
  const { user, updateLocation } = useContext(AuthContext);
  const API = import.meta.env.VITE_API_URL;

  const save = async () => {
    const res = await fetch(`${API}/api/user/location`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location }),
    });

    const data = await res.json();
    updateLocation(location);
    close();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Select Job Location</h2>

        <input
          className="w-full border px-3 py-2 rounded-md"
          placeholder="Enter location (e.g., Mumbai)"
          onChange={(e) => setLocation(e.target.value)}
        />

        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={close}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-4 py-2 bg-sky-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}