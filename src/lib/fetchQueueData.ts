export interface QueueItem {
  id: string;
  name: string;
  division: string;
  members: number;
}

export interface QueueStats {
  total: number;
  active: number;
  inactive: number;
  percentActive: number;
}

export async function fetchQueueData(): Promise<{ queues: QueueItem[]; stats: QueueStats }> {
  // This is a placeholder. Replace with actual API call.
  // You will provide the API link later.
  console.warn("fetchQueueData: Placeholder function called. Replace with actual API call.");

  // Mock data for development
  const mockQueues: QueueItem[] = [
    { id: "q1", name: "Sales Queue", division: "Sales", members: 15 },
    { id: "q2", name: "Support Queue", division: "Customer Service", members: 25 },
    { id: "q3", name: "Billing Queue", division: "Finance", members: 10 },
    { id: "q4", name: "Technical Support", division: "Customer Service", members: 30 },
    { id: "q5", name: "VIP Sales", division: "Sales", members: 5 },
  ];

  const activeQueues = mockQueues.filter(q => q.members > 0).length;
  const inactiveQueues = mockQueues.length - activeQueues;
  const percentActive = mockQueues.length > 0 ? (activeQueues / mockQueues.length) * 100 : 0;

  const mockStats: QueueStats = {
    total: mockQueues.length,
    active: activeQueues,
    inactive: inactiveQueues,
    percentActive: parseFloat(percentActive.toFixed(2)),
  };

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ queues: mockQueues, stats: mockStats });
    }, 1000); // Simulate network delay
  });
}
