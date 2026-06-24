"use client";
import { useEffect, useState } from "react";

export default function TemperatureCard() {
  const [temp, setTemp] = useState<number | null>(null);

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/mod3_sensor_data?select=temperature&id=eq.1`;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(url, {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          },
          cache: "no-store",
        });

        const data = await res.json();
        if (data.length > 0) setTemp(data[0].temperature);

      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
    const i = setInterval(fetchData, 5000);
    return () => clearInterval(i);

  }, []);

  return (
    <div className="bg-zinc-800 p-5 rounded-xl">
      <p>Temperature</p>
      <p className="text-2xl">{temp ?? "..."} °C</p>
    </div>
  );
}