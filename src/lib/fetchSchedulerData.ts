export async function fetchSchedulerData() {
  const res = await fetch("/proxy/aws-scheduler");
  if (!res.ok) throw new Error("Failed to fetch AWS Scheduler data.");
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error("Invalid response");
  }

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
