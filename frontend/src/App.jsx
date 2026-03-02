import { useState } from "react";

export default function App() {
  const [email, setEmail] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkEmail = async () => {
    if (!email) return;

    setLoading(true);
    setData(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      setData(result);
    } catch (err) {
      alert("Backend connection failed");
    }

    setLoading(false);
  };

  const getColor = (level) => {
    if (level === "Critical") return "text-red-500";
    if (level === "High") return "text-orange-400";
    if (level === "Medium") return "text-yellow-400";
    return "text-green-400";
  };

  const getBadge = (level) => {
    if (level === "Critical") return "bg-red-600";
    if (level === "High") return "bg-orange-500";
    if (level === "Medium") return "bg-yellow-500";
    return "bg-green-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-8">

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          🔐 Breach Intelligence Platform
        </h1>
        <p className="text-gray-400 mt-2">
          Cyber Threat Exposure & Risk Analysis Dashboard
        </p>
      </div>

      {/* Search Box */}
      <div className="flex justify-center mb-10">
        <input
          type="email"
          placeholder="Enter email address"
          className="bg-gray-800 p-3 w-96 rounded-l border border-gray-700 focus:outline-none focus:border-cyan-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={checkEmail}
          className="bg-cyan-500 px-6 rounded-r hover:bg-cyan-600 transition-all"
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </div>

      {data && (
        <div className="max-w-5xl mx-auto space-y-10">

          {/* Risk Overview */}
          <div className="bg-gray-900/70 backdrop-blur-md p-8 rounded-2xl border border-gray-800 shadow-xl">

            <h2 className="text-2xl font-semibold mb-6">Risk Overview</h2>

            {/* Risk Gauge */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-400">Breach Count</p>
                <p className="text-3xl font-bold">{data.breach_count}</p>
              </div>

              <div>
                <p className="text-gray-400">Risk Score</p>
                <p className="text-3xl font-bold">
                  {data.risk_score}%
                </p>
              </div>

              <div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getBadge(
                    data.risk_level
                  )}`}
                >
                  {data.risk_level}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-4 mb-6">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-red-500 to-yellow-500"
                style={{ width: `${data.risk_score}%` }}
              ></div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-lg mb-2">Exposed Categories</h3>
              <div className="flex flex-wrap gap-2">
                {data.exposed_categories?.map((cat, i) => (
                  <span
                    key={i}
                    className="bg-red-900/60 px-3 py-1 rounded-full text-sm border border-red-700"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-lg mb-2">Security Recommendations</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {data.recommendations?.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>

          </div>

          {/* Breach Timeline */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">
              Breach Timeline
            </h2>

            <div className="space-y-6">
              {data.breaches?.map((breach, i) => (
                <div
                  key={i}
                  className="bg-gray-900/70 backdrop-blur-md p-6 rounded-xl border border-gray-800 hover:border-cyan-400 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-cyan-400 font-bold text-lg">
                      {breach.name}
                    </h3>
                    <span className="text-gray-400 text-sm">
                      {breach.breach_date}
                    </span>
                  </div>

                  <p className="text-sm mt-2 text-gray-400">
                    Domain: {breach.domain}
                  </p>

                  <span
                    className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${getBadge(
                      breach.severity
                    )}`}
                  >
                    {breach.severity}
                  </span>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {breach.exposed_data?.map((d, j) => (
                      <span
                        key={j}
                        className="bg-gray-800 px-2 py-1 text-xs rounded border border-gray-700"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}