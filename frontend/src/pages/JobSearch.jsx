



import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function JobSearch() {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);

  const jobs = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "TechNova",
      logo: "https://cdn-icons-png.flaticon.com/512/5968/5968292.png",
      location: "Bengaluru",
      salary: "₹8L - ₹15L",
      type: "Full Time",
      experience: "2 - 4 yrs",
    },
    {
      id: 2,
      title: "UI/UX Designer",
      company: "DesignHub",
      logo: "https://cdn-icons-png.flaticon.com/512/5968/5968705.png",
      location: "Remote",
      salary: "₹6L - ₹12L",
      type: "Remote",
      experience: "1 - 3 yrs",
    },
    {
      id: 3,
      title: "Backend Developer (Node.js)",
      company: "CloudWorks",
      logo: "https://cdn-icons-png.flaticon.com/512/919/919825.png",
      location: "Hyderabad",
      salary: "₹10L - ₹18L",
      type: "Hybrid",
      experience: "3 - 5 yrs",
    },
  ];

  const totalPages = 5;

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  // Save job
  const toggleSaveJob = (id) => {
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((job) => job !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full bg-gray-50 py-12 px-4 flex justify-center">
      <div className="w-full max-w-7xl space-y-10">

        {/* ------------------ JOB SEARCH BAR ------------------ */}
        <div className="w-full max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl font-bold text-center text-gray-900">
            Discover Your Next Career Move
          </h1>

          <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by title, skills…"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black transition"
            />

            <input
              type="text"
              placeholder="Location"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black transition"
            />

            <button className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition w-full md:w-auto">
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {["Full Time", "Part Time", "Remote", "Hybrid", "Internship"].map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm shadow-sm hover:bg-gray-100 cursor-pointer transition"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ------------------ JOB POSTS ------------------ */}
        <div className="space-y-4">
          {loading ? (
            <SkeletonLoader />
          ) : (
            jobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  {/* Logo + Basic Info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={job.logo}
                      alt="logo"
                      className="h-14 w-14 rounded-xl object-contain bg-gray-100 p-2"
                    />
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                      <p className="text-gray-600">{job.company}</p>
                      <p className="text-gray-600 text-sm">{job.location}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  {/* Right Side (Badges + Favourite) */}
                  <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">

                    {/* Badges */}
                    <div className="flex flex-wrap gap-3">
                      <Badge text={job.type} />
                      <Badge text={job.salary} />
                      <Badge text={job.experience} />
                    </div>

                    {/* Favourite Icon */}
                    <button onClick={() => toggleSaveJob(job.id)}>
                      <Heart
                        className={`w-6 h-6 transition ${
                          savedJobs.includes(job.id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400 hover:text-black"
                        }`}
                      />
                    </button>

                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* ------------------ PAGINATION ------------------ */}
        <Pagination page={page} setPage={setPage} totalPages={totalPages} />

      </div>
    </div>
  );
}

/* ---------- REUSABLE COMPONENTS ---------- */

function Badge({ text }) {
  return (
    <span className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium whitespace-nowrap">
      {text}
    </span>
  );
}

function Pagination({ page, setPage, totalPages }) {
  return (
    <div className="flex justify-center items-center gap-3 pt-6">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition disabled:opacity-40"
      >
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => setPage(i + 1)}
          className={`px-4 py-2 rounded-xl transition ${
            page === i + 1
              ? "bg-black text-white"
              : "border border-gray-300 hover:bg-gray-100"
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-200"
        >
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-gray-200 rounded-xl"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/5"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}