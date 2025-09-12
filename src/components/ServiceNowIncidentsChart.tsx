import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { LoaderCircle, XCircle } from "lucide-react";

const ServiceNowIncidentsChart: React.FC = () => {
  const [incidentCount, setIncidentCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncidentCount = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/proxy/servicenow-incidents");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          if (typeof data.count === "number") {
            setIncidentCount(data.count);
          } else {
            throw new Error("Invalid data format");
          }
        } catch (e) {
          throw new Error("Invalid response");
        }
      } catch (err) {
        console.error("Error fetching ServiceNow incidents:", err);
        setError((err as Error).message || "Failed to fetch incident data");
        setIncidentCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidentCount();
  }, []);

  const getChartProps = (count: number | null) => {
    let color = "#4CAF50";
    let text = "No Incidents";

    if (count === null || loading) {
      color = "#607D8B";
      text = "Loading...";
    } else if (count === 1) {
      color = "#FFEB3B";
      text = "1";
    } else if (count === 2) {
      color = "#FFC107";
      text = "2";
    } else if (count === 3) {
      color = "#FF9800";
      text = "3";
    } else if (count === 4) {
      color = "#FF5722";
      text = "4";
    } else if (count >= 5) {
      color = "#F44336";
      text = `${count}`;
    }

    return { color, text };
  };

  const { color, text } = getChartProps(incidentCount);

  if (loading) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-xl p-3 rounded-2xl shadow-2xl flex flex-col items-center justify-center h-36 border border-cyan-400/30 animate-pulse">
        <LoaderCircle
          className="animate-spin text-cyan-400 drop-shadow-lg"
          size={36}
        />
        <p className="text-cyan-200 text-sm mt-3 font-medium">
          Loading incidents...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-xl p-3 rounded-2xl shadow-2xl flex flex-col items-center justify-center h-36 border border-red-400/30">
        <XCircle className="text-red-400 drop-shadow-lg" size={36} />
        <p className="text-sm mt-2 text-red-300 font-semibold">
          Error: {error}
        </p>
        <p className="text-xs text-gray-300">Displaying 0 incidents.</p>
      </div>
    );
  }

  const data = [{ name: "Incidents", value: 1 }];

  return (
    <div className="relative bg-gray-800/40 backdrop-blur-xl p-3 rounded-3xl shadow-2xl flex flex-col items-center justify-center h-44 border border-cyan-400/20 overflow-hidden">
      {/* Animated Glow Border */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-cyan-500 to-purple-600 animate-[spin_6s_linear_infinite] opacity-30 blur-xl"></div>

      <h2 className="text-lg font-bold text-white mb-3 tracking-wide drop-shadow-md">
        ServiceNow Incidents
      </h2>

      <ResponsiveContainer width="100%" height={80}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={25}
            outerRadius={35}
            fill="#8884d8"
            dataKey="value"
            isAnimationActive={true}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={color}
                className="drop-shadow-[0_0_12px_rgba(0,0,0,0.6)]"
              />
            ))}
          </Pie>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="20"
            fontWeight="700"
            fill="#fff"
          >
            {text}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ServiceNowIncidentsChart;
