"use client";

import { useEffect, useState } from "react";

export default function FanCard() {
  const [fanOn, setFanOn] = useState(false);
  const [current_threshold, setThreshold] = useState(25);
  const [loading, setLoading] = useState(false);

  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/mod3_sensor_data`;

  const headers = {
    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  // ✅ Fetch latest fan + threshold state — same pattern as the working
  // ServoCard: fetch immediately on mount, then poll every 5s. Filters
  // by id=eq.1 (instead of order/limit) so it always reads the exact
  // row the toggle button writes to.
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${baseUrl}?select=fan,current_threshold&id=eq.1`, {
          headers,
          cache: "no-store",
        });

        const data = await res.json();

        if (data.length > 0) {
          const row = data[0];
          setFanOn(row.fan ?? false);

          if (row.current_threshold !== undefined && row.current_threshold !== null) {
            setThreshold(row.current_threshold);
          }
        }
      } catch (error) {
        console.error("Failed to fetch fan status:", error);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Manual toggle — PATCH the existing row, only update local UI once
  // Supabase actually confirms the write
  async function toggleFan() {
    setLoading(true);
    const newState = !fanOn;

    try {
      const res = await fetch(`${baseUrl}?id=eq.1`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          fan: newState,
        }),
      });

      if (!res.ok) throw new Error(`PATCH failed: ${res.status}`);

      setFanOn(newState);
    } catch (err) {
      console.error("Toggle failed:", err);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Update auto threshold
  async function setAutoThreshold() {
    try {
      const res = await fetch(`${baseUrl}?id=eq.1`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          current_threshold: current_threshold,
        }),
      });

      if (!res.ok) throw new Error(`PATCH failed: ${res.status}`);

      console.log("Threshold updated:", current_threshold);
    } catch (err) {
      console.error("Failed to set threshold:", err);
    }
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 flex flex-col gap-4">

      {/* Fan status */}
      <div>
        <p className="text-sm text-zinc-400 mb-2">Fan</p>

        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
              fanOn
                ? "bg-green-600 text-white"
                : "bg-zinc-700 text-zinc-400"
            }`}
          >
            💨 {fanOn ? "Fan On" : "Fan Off"}
          </div>
        </div>
      </div>

      {/* Manual toggle */}
      <button
        onClick={toggleFan}
        disabled={loading}
        className={`w-full py-2 rounded-lg font-medium transition-colors text-white ${
          fanOn
            ? "bg-red-600 hover:bg-red-700"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {fanOn ? "Turn Fan Off" : "Turn Fan On"}
      </button>

      {/* Threshold control */}
      <div>
        <label className="text-sm text-zinc-400 block mb-2">
          Auto Threshold (°C)
        </label>

        <div className="flex gap-2">
          <input
            type="number"
            value={current_threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="bg-zinc-700 border border-zinc-600 text-white rounded-lg px-3 py-2 w-full
                       focus:outline-none focus:border-blue-500"
          />

          <button
            onClick={setAutoThreshold}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg
                       font-medium transition-colors whitespace-nowrap"
          >
            Set
          </button>

        </div>
      </div>

    </div>
  );
}
