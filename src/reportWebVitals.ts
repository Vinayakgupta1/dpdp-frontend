type ReportHandler = (metric: unknown) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler): void => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import("web-vitals").then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onINP(onPerfEntry);
      onLCP(onPerfEntry);
      onFCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
