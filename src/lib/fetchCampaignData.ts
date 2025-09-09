export interface CampaignItem {
  id: string;
  name: string;
  status: "ON" | "OFF" | "UNKNOWN";
  percentage: number;
}

export interface CampaignStats {
  total: number;
  on: number;
  off: number;
  percentOn: number;
}

interface CampaignApiResponse {
  campaigns: CampaignItem[];
}

const campaignCache = new Map<string, { data: CampaignStats & { campaigns: CampaignItem[] }; timestamp: number }>();
const CAMPAIGN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export async function fetchCampaignData(): Promise<{
  campaignData: CampaignItem[];
  campaignStats: CampaignStats;
}> {
  const cacheKey = "campaignData";
  const now = Date.now();

  if (campaignCache.has(cacheKey)) {
    const cached = campaignCache.get(cacheKey)!;
    if (now - cached.timestamp < CAMPAIGN_CACHE_DURATION) {
      return { campaignData: cached.data.campaigns, campaignStats: cached.data };
    }
  }

  try {
    const res = await fetch("/proxy/campaign-status");

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`HTTP Error fetching campaign data: ${res.status}`, errorText);
      throw new Error(
        `Network response was not ok (${res.status}): ${errorText}`
      );
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error(`Expected JSON data, got: '${contentType}' for campaign data`);
    }

    const apiResponse: CampaignApiResponse = await res.json();

    const campaigns = apiResponse.campaigns || [];

    const total = campaigns.length;
    const on = campaigns.filter((c) => c.status === "ON").length;
    const off = campaigns.filter((c) => c.status === "OFF").length;
    const percentOn = total > 0 ? parseFloat(((on / total) * 100).toFixed(2)) : 0;

    const stats: CampaignStats = { total, on, off, percentOn };

    campaignCache.set(cacheKey, { data: { ...stats, campaigns }, timestamp: Date.now() });

    return { campaignData: campaigns, campaignStats: stats };
  } catch (err) {
    console.error("Error in fetchCampaignData:", err);
    throw err; // Re-throw to be caught by the component
  }
}
