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
        // Assuming a proxy endpoint for ServiceNow incidents
        const response = await fetch("/proxy/servicenow-incidents");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Assuming the API returns an object like { count: number }
        if (typeof data.count === "number") {
          setIncidentCount(data.count);
        } else {
          throw new Error(
            "Invalid data format: count not found or not a number"
          );
        }
      } catch (err) {
        console.error("Error fetching ServiceNow incidents:", err);
        setError((err as Error).message || "Failed to fetch incident data");
        setIncidentCount(0); // Default to 0 incidents on error
      } finally {
        setLoading(false);
      }
    };

    fetchIncidentCount();
  }, []);

  const getChartProps = (count: number | null) => {
    let color = "#4CAF50"; // Green for 0 incidents
    let text = "No Incidents";

    if (count === null || loading) {
      color = "#607D8B"; // Grey for loading/error
      text = "Loading...";
    } else if (count === 1) {
      color = "#FFEB3B"; // Light Yellow for 1
      text = "1";
    } else if (count === 2) {
      color = "#FFC107"; // Yellow for 2
      text = "2";
    } else if (count === 3) {
      color = "#FF9800"; // Light Orange for 3
      text = "3";
    } else if (count === 4) {
      color = "#FF5722"; // Orange for 4
      text = "4";
    } else if (count >= 5) {
      color = "#F44336"; // Red for 5+
      text = `${count}`;
    }

    return { color, text };
  };

  const { color, text } = getChartProps(incidentCount);

  if (loading) {
    return (
      <div className="bg-gray-700 p-4 rounded-2xl shadow flex flex-col items-center justify-center h-40">
        <LoaderCircle className="animate-spin text-cyan-400" size={32} />
        <p className="text-white text-sm mt-2">Loading incidents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-700 p-4 rounded-2xl shadow flex flex-col items-center justify-center h-40 text-red-400">
        <XCircle size={32} />
        <p className="text-sm mt-2">Error: {error}</p>
        <p className="text-xs">Displaying 0 incidents.</p>
      </div>
    );
  }

  const data = [{ name: "Incidents", value: 1 }]; // Single slice for the whole circle

  return (
    <div className="bg-gray-700 p-4 rounded-2xl shadow flex flex-col items-center justify-center h-40">
      <h2 className="text-lg font-semibold text-white mb-2">
        ServiceNow Incidents
      </h2>
      <ResponsiveContainer width="100%" height={100}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={40}
            fill="#8884d8"
            paddingAngle={0}
            dataKey="value"
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={color} />
            ))}
          </Pie>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-white font-bold text-lg"
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
