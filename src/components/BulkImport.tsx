import { QueueItem, QueueStats } from "@/lib/fetchQueueData";
import { QueuesStatus } from "./QueuesStatus";
import { CheckCircle2, XCircle } from "lucide-react";

interface BulkImportProps {
  queueData: QueueItem[];
  queueStats: QueueStats | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function BulkImport({
  queueData,
  queueStats,
  isLoading,
  error,
  onRetry,
}: BulkImportProps) {
  const isBulkImportCompleted = queueData.every((queue) => queue.members > 0);

  return (
    <div className="min-h-screen p-2 font-sans bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#2563eb] mt-[-1rem]">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header */}
        <div className="glassmorphism p-5 rounded-xl shadow-xl border border-cyan-500/20 flex items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-lg font-bold font-sans tracking-tight">
              Bulk Import Status
            </h1>
            <p className="text-gray-300 text-base">
              Monitor the status of bulk imports based on queue member data.
            </p>
          </div>
          <div className="glassmorphism p-2 rounded-lg flex items-center gap-2">
            {isBulkImportCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <p className="text-base font-semibold">
              Bulk Import Status:{" "}
              <span
                className={
                  isBulkImportCompleted ? "text-emerald-400" : "text-red-400"
                }
              >
                {isBulkImportCompleted ? "Completed" : "Not Completed"}
              </span>
            </p>
          </div>
        </div>

        {/* Render QueuesStatus component with its features */}
        <QueuesStatus
          queueData={queueData}
          queueStats={queueStats}
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
        />
      </div>
    </div>
  );
}
