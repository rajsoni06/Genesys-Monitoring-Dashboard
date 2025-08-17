// Performance monitoring utility for PastRecords component

interface PerformanceMetrics {
  apiCallTime: number;
  cacheHit: boolean;
  totalRecords: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 50; // Keep last 50 measurements

  recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    
    // Keep only the last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
    
    console.log(`📊 Performance: ${metric.apiCallTime}ms, Cache: ${metric.cacheHit ? 'HIT' : 'MISS'}, Records: ${metric.totalRecords}`);
  }

  getAverageApiTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, m) => sum + m.apiCallTime, 0);
    return Math.round(total / this.metrics.length);
  }

  getCacheHitRate(): number {
    if (this.metrics.length === 0) return 0;
    const hits = this.metrics.filter(m => m.cacheHit).length;
    return Math.round((hits / this.metrics.length) * 100);
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  clear(): void {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Utility function to measure API call time
export const measureApiCall = async <T>(
  apiCall: () => Promise<T>,
  cacheHit: boolean = false
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const endTime = performance.now();
    const apiCallTime = Math.round(endTime - startTime);
    
    performanceMonitor.recordMetric({
      apiCallTime,
      cacheHit,
      totalRecords: Array.isArray(result) ? result.length : 0,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const apiCallTime = Math.round(endTime - startTime);
    
    performanceMonitor.recordMetric({
      apiCallTime,
      cacheHit: false,
      totalRecords: 0,
      timestamp: Date.now()
    });
    
    throw error;
  }
}; 