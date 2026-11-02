"use client";

import { useState, useEffect } from "react";

interface EnergyLog {
  id: number;
  device_name: string;
  power_consumed_kwh: number;
}

interface MissionTask {
  id: number;
  task_name: string;
  category: string;
  reward_points: number;
}

interface CarbonStats {
  total_energy_kwh: number;
  gross_carbon_footprint_kg: number;
  carbon_offset_kg: number;
  net_carbon_footprint_kg: number;
  total_eco_points: number;
  current_badge: string;
  next_milestone_points: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  eco_points: number;
  co2_saved_kg: number;
  badge: string;
}

export default function Home() {
  const [energyLogs, setEnergyLogs] = useState<EnergyLog[]>([]);
  const [missionTasks, setMissionTasks] = useState<MissionTask[]>([]);
  const [stats, setStats] = useState<CarbonStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const [deviceName, setDeviceName] = useState("");
  const [powerKwh, setPowerKwh] = useState("");
  const [taskName, setTaskName] = useState("");
  const [category, setCategory] = useState("Energy Saving");
  const [rewardPoints, setRewardPoints] = useState("");

  const API_BASE = "http://127.0.0.1:8000";

  const fetchData = async () => {
    try {
      const [logsRes, tasksRes, statsRes, boardRes] = await Promise.all([
        fetch(`${API_BASE}/energy-logs/`),
        fetch(`${API_BASE}/mission-tasks/`),
        fetch(`${API_BASE}/carbon-stats/`),
        fetch(`${API_BASE}/leaderboard/`),
      ]);
      if (logsRes.ok) setEnergyLogs(await logsRes.json());
      if (tasksRes.ok) setMissionTasks(await tasksRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (boardRes.ok) setLeaderboard(await boardRes.json());
    } catch (error) {
      console.error("Backend connection error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEnergyLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName || !powerKwh) return;
    await fetch(`${API_BASE}/energy-logs/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_name: deviceName,
        power_consumed_kwh: parseFloat(powerKwh),
      }),
    });
    setDeviceName("");
    setPowerKwh("");
    fetchData();
  };

  const handleDeleteEnergyLog = async (id: number) => {
    await fetch(`${API_BASE}/energy-logs/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleAddMissionTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName || !rewardPoints) return;
    await fetch(`${API_BASE}/mission-tasks/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task_name: taskName,
        category: category,
        reward_points: parseInt(rewardPoints),
      }),
    });
    setTaskName("");
    setRewardPoints("");
    fetchData();
  };

  const handleDeleteMissionTask = async (id: number) => {
    await fetch(`${API_BASE}/mission-tasks/${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-emerald-400">🌱 EcoPulse Platform</h1>
            <p className="text-slate-400 mt-1">
              Track 1: Mission LiFE Engagement, Citizen Energy Tracking & Gamified Carbon Footprint
            </p>
          </div>
          <div className="bg-emerald-950/60 border border-emerald-700/50 px-4 py-2.5 rounded-xl text-emerald-300 text-sm font-semibold">
            Current Rank: {stats ? stats.current_badge : "🌱 Eco Beginner"}
          </div>
        </header>

        {/* 4 Carbon & Gamification Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-xs uppercase tracking-wider">Total Energy Used</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {stats ? stats.total_energy_kwh : 0} kWh
            </h3>
          </div>
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-xs uppercase tracking-wider">Gross Carbon Footprint</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">
              {stats ? stats.gross_carbon_footprint_kg : 0} kg CO₂
            </h3>
          </div>
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-xs uppercase tracking-wider">CO₂ Offset (Mission LiFE)</p>
            <h3 className="text-2xl font-bold text-teal-400 mt-1">
              -{stats ? stats.carbon_offset_kg : 0} kg CO₂
            </h3>
          </div>
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-xs uppercase tracking-wider">Mission LiFE Eco Points</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">
              ⭐ {stats ? stats.total_eco_points : 0} pts
            </h3>
          </div>
        </div>

        {/* Main 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Citizen Energy Tracker */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h2 className="text-lg font-semibold mb-4 text-emerald-300">⚡ Citizen Energy Tracker</h2>
            <form onSubmit={handleAddEnergyLog} className="space-y-3 mb-5">
              <input
                type="text"
                placeholder="Appliance (e.g., AC, EV Charger)"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Power Consumed (kWh)"
                value={powerKwh}
                onChange={(e) => setPowerKwh(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-sm transition"
              >
                + Log Energy Usage
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {energyLogs.length === 0 ? (
                <p className="text-slate-500 text-sm">No energy logs recorded yet.</p>
              ) : (
                energyLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex justify-between items-center bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-sm"
                  >
                    <div>
                      <span className="font-medium text-slate-200">{log.device_name}</span>
                      <span className="text-amber-400 font-semibold ml-2">{log.power_consumed_kwh} kWh</span>
                    </div>
                    <button
                      onClick={() => handleDeleteEnergyLog(log.id)}
                      className="text-xs text-rose-400 hover:text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Mission LiFE Engagement */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h2 className="text-lg font-semibold mb-4 text-emerald-300">🎯 Mission LiFE Actions</h2>
            <form onSubmit={handleAddMissionTask} className="space-y-3 mb-5">
              <input
                type="text"
                placeholder="Eco Action (e.g., Switched to LED)"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-sm text-white"
                >
                  <option value="Energy Saving">Energy Saving</option>
                  <option value="Water Conservation">Water Saved</option>
                  <option value="Waste Reduction">Waste Reduced</option>
                  <option value="Sustainable Transport">Green Transit</option>
                </select>
                <input
                  type="number"
                  placeholder="Points (e.g. 50)"
                  value={rewardPoints}
                  onChange={(e) => setRewardPoints(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-sm transition"
              >
                + Complete Mission Task
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {missionTasks.length === 0 ? (
                <p className="text-slate-500 text-sm">No Mission LiFE tasks added yet.</p>
              ) : (
                missionTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex justify-between items-center bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-200">{task.task_name}</p>
                      <span className="text-xs text-slate-400">{task.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-xs font-semibold">
                        +{task.reward_points} pts
                      </span>
                      <button
                        onClick={() => handleDeleteMissionTask(task.id)}
                        className="text-xs text-rose-400 hover:text-rose-300"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Gamified Carbon Leaderboard */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h2 className="text-lg font-semibold mb-4 text-emerald-300">🏆 Citizen Leaderboard</h2>
            <p className="text-xs text-slate-400 mb-4">
              Complete Mission LiFE tasks to earn Eco Points, offset CO₂, and climb the ranks!
            </p>
            <div className="space-y-3">
              {leaderboard.map((user) => (
                <div
                  key={user.rank}
                  className={`p-3 rounded-lg border text-sm flex justify-between items-center ${
                    user.name.includes("You")
                      ? "bg-emerald-950/40 border-emerald-600"
                      : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <div>
                    <span className="font-bold text-emerald-400 mr-2">#{user.rank}</span>
                    <span className="font-medium text-white">{user.name}</span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {user.badge} • Saved {user.co2_saved_kg} kg CO₂
                    </p>
                  </div>
                  <span className="font-bold text-emerald-300">{user.eco_points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}