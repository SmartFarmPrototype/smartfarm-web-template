"use client";

import { useEffect, useState } from "react";

export default function FanCard() {
  const [fanOn, setFanOn] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number>(22);
  const [mode, setMode] = useState<"AUTO" | "MANUAL">("AUTO");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch latest state
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}mod3_sensor_data?select=*&order=created_at.desc&limit=1`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (data && data.length > 0) {
          const row = data[0];

          setFanOn(row.fan ?? false);

          // Optional fields (only if you added them in DB)
          if (row.threshold) setThreshold(row.threshold);
          if (row.mode) setMode(row.mode);
        }

      } catch (err) {
        console.error("Failed to fetch fan data:", err);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Manual toggle
  async function toggleFan() {
    setLoading(true);

    try {
      const newState = !fanOn;

      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}mod3_sensor_data`,
        {
          method: "POST",
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fan: newState,
            mode: "MANUAL",   // ✅ force manual mode
          }),
        }
      );

      setFanOn(newState);
      setMode("MANUAL");

    } catch (err) {
      console.error("Failed to toggle fan:", err);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Set AUTO threshold
  async function setAutoThreshold() {
    setLoading(true);

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/mod3_sensor`,
        {
          method: "POST",
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            threshold: threshold,
            mode: "AUTO",
          }),
        }
      );

      setMode("AUTO");

    } catch (err) {
      console.error("Failed to set threshold:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 flex flex-col gap-4">

      {/* ✅ Fan status */}
      <div>
        <p className="text-sm text-zinc-400 mb-2">Fan</p>

        <div className="flex gap-2 flex-wrap">
          <div
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              fanOn
                ? "bg-green-600 text-white"
                : "bg-zinc-700 text-zinc-400"
            }`}
          >
            💨 {fanOn ? "Fan On" : "Fan Off"}
          </div>

          <div
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              mode === "AUTO"
                ? "bg-blue-600 text-white"
                : "bg-yellow-600 text-white"
            }`}
          >
            ⚙ {mode}
          </div>
        </div>
      </div>

      {/* ✅ Manual toggle */}
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

      {/* ✅ Threshold input */}
      <div>
        <label className="text-sm text-zinc-400 block mb-2">
          Auto Threshold (°C)
        </label>

        <div className="flex gap-2">
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="bg-zinc-700 border border-zinc-600 text-white rounded-lg px-3 py-2 w-full"
          />

          <button
            onClick={setAutoThreshold}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
}