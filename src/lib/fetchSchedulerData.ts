export async function fetchSchedulerData() {
  const res = await fetch("/proxy/aws-scheduler");
  if (!res.ok) throw new Error("Failed to fetch AWS Scheduler data.");
  const data = await res.json();

  return {
    schedulerData: data.schedulerData || [],
    schedulerStats: data.schedulerStats || {
      total: 0,
      enabled: 0,
      disabled: 0,
      percentEnabled: 0,
    },
  };
}
