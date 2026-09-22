declare module "web-vitals" {
  export function onCLS(cb: (metric: any) => void): void;
  export function onINP(cb: (metric: any) => void): void;
  export function onLCP(cb: (metric: any) => void): void;
  export function onFCP(cb: (metric: any) => void): void;
  export function onTTFB(cb: (metric: any) => void): void;
}
