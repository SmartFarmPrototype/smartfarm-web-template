"use client";

import Navbar from "./components/Navbar";
import SoilHumidityCard from "./components/module1/SoilHumidityCard";
import WaterLevelCard from "./components/module1/WaterLevelCard";
import LightCard from "./components/module2/LightCard";
import LedThresholdCard from "./components/module2/LedThresholdCard";
import LcdMessageCard from "./components/module2/LcdMessageCard";
import TemperatureCard from "./components/module3/TemperatureCard";
import HumidityCard from "./components/module3/HumidityCard";
import FanCard from "./components/module3/FanCard";
import ServoCard from "./components/module3/ServoCard";

export default function Home() {
    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="max-w-6xl mx-auto px-6 py-8 space-y-10">

                {/* ── Module 1 ───────────────────────────────────────────── */}
                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-white">
                            Soil &amp; Water
                        </h2>
                        <p className="text-zinc-400 text-sm mt-1">
                            Monitors soil moisture and water levels. Activates buzzer when
                            water drops below the threshold.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SoilHumidityCard />
                        <WaterLevelCard />
                    </div>
                </section>

                {/* ── Module 2 ───────────────────────────────────────────── */}
                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-white">
                            Light &amp; Display
                        </h2>
                        <p className="text-zinc-400 text-sm mt-1">
                            Monitors light levels. Turns LED on when light drops below the
                            threshold, and lets you send messages to the LCD screen.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <LightCard />
                        <LedThresholdCard />
                        <LcdMessageCard />
                    </div>
                </section>

                {/* ── Module 3 ───────────────────────────────────────────── */}
                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-white">
                            Climate &amp; Devices
                        </h2>
                        <p className="text-zinc-400 text-sm mt-1">
                            Monitors temperature and humidity. Controls the fan automatically
                            based on a threshold, and lets you open/close the door remotely.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <TemperatureCard />
                        <HumidityCard />
                        <FanCard />
                        <ServoCard />
                    </div>
                </section>

            </main>
        </div>
    );
}