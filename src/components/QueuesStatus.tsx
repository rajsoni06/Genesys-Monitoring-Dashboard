import { useState } from "react";
import {
  Search,
  LoaderCircle,
  ListChecks,
} from "lucide-react";
import { QueueItem, QueueStats } from "@/lib/fetchQueueData";

interface QueuesStatusProps {
  queueData: QueueItem[];
  queueStats: QueueStats | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function QueuesStatus({
  queueData,
  queueStats,
  isLoading,
  error,
  onRetry,
}: QueuesStatusProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredQueues = queueData.filter(
    (queue) =>
      queue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      queue.division.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-2 font-sans bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#2563eb] mt-[-1rem]">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header */}
        <div className="glassmorphism p-5 rounded-xl shadow-xl border border-cyan-500/20 flex items-center gap-4 mb-2">
          <ListChecks className="w-9 h-7 text-cyan-400 animate-pulse-slow" />
          <div>
            <h1 className="text-lg font-bold font-sans tracking-tight">
              Queue Status Dashboard
            </h1>
            <p className="text-gray-300 text-base">
              Monitor the real-time status and details of your Genesys Cloud queues.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="glassmorphism p-4 rounded-xl shadow-lg border border-cyan-400/30 flex items-center gap-3 mb-4">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by queue name or division..."
            className="flex-grow bg-transparent outline-none text-white placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Queue Table */}
        <div className="glassmorphism p-4 rounded-xl shadow-lg border border-cyan-400/30 mt-4 max-h-[70vh] overflow-y-auto">
          {error ? (
            <div className="text-sm text-red-500 p-2 bg-red-100 dark:bg-red-900/30 rounded-md flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={onRetry}
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 p-2">
              <span>Loading queue data...</span>
              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
            </div>
          ) : filteredQueues.length > 0 ? (
            <QueueTable data={filteredQueues} />
          ) : (
            <div className="text-sm text-gray-400 text-center py-2">
              No queues found matching your search criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Table component for queues
function QueueTable({ data }: { data: QueueItem[] }) {
  return (
    <table className="w-full text-xs sm:text-sm table-auto border-separate border-spacing-y-2">
      <thead>
        <tr className="text-cyan-300 font-semibold">
          <th className="text-left pl-2">Queue Name</th>
          <th className="text-left pl-2">Division</th>
          <th className="text-left pl-2">Members</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr
            key={item.id}
            className="bg-gray-900/70 rounded-xl hover:bg-gray-800 transition-all"
            style={{ borderRadius: "10px" }}
          >
            <td className="pl-2 py-2 font-medium truncate max-w-[180px] text-white">
              {item.name}
            </td>
            <td className="pl-2 py-2 font-medium text-white">
              {item.division}
            </td>
            <td className="pl-2 py-2 font-medium text-white">
              {item.members}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}