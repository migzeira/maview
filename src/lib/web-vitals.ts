import { onCLS, onFID, onLCP, onFCP, onTTFB, type Metric } from "web-vitals";

function reportMetric(metric: Metric) {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}`);
  }

  // TODO: Send to analytics endpoint when configured
  // Example: navigator.sendBeacon('/api/vitals', JSON.stringify(metric));
}

export function initWebVitals() {
  onCLS(reportMetric);
  onFID(reportMetric);
  onLCP(reportMetric);
  onFCP(reportMetric);
  onTTFB(reportMetric);
}
