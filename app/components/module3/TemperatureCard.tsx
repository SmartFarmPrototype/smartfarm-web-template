"use client";

import { useEffect, useState } from "react";

export default function TemperatureCard() {
  const [temperature, setTemperature] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}mod3_sensor_data?select=temperature&order=created_at.desc&limit=1`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            },
            cache: "no-store",
          }
        );


        const data = await response.json();
        console.log("FETCH DATA:", data);

        if (data && data.length > 0) {
          setTemperature(data[0].temperature);
        }
      } catch (error) {

        console.error("Failed to fetch temperature:", error);
      }
    }

    fetchData();

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
      <p className="text-sm text-zinc-400 mb-1">Temperature</p>
      <p className="text-3xl font-bold">
        {temperature ?? "—"}
        <span className="text-lg text-zinc-400 ml-2">°C</span>
      </p>
    </div>
  );
}
