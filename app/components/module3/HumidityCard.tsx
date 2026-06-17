"use client";

import { useEffect, useState } from "react";

export default function HumidityCard() {
  const [humidity, setHumidity] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/mod3_sensor_data?select=humidity&id=eq.1`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            },
            cache: "no-store", // ✅ IMPORTANT
          }
        );

        const data = await response.json();
        console.log("HUMIDITY DATA:", data);

    if (Array.isArray(data) && data.length > 0 && data[0]) {
      setHumidity(data[0].humidity ?? null);
    } else {
      console.log("No humidity data found:", data);
    }

      } catch (error) {
        console.error("Failed to fetch humidity:", error);
      }
    }

    fetchData();

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);

  }, []);

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
      <p className="text-sm text-zinc-400 mb-1">Humidity</p>
      <p className="text-3xl font-bold">
        {humidity ?? "Loading..."}
        <span className="text-lg text-zinc-400 ml-2">%</span>
      </p>
    </div>
  );
}