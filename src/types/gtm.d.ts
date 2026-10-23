export type GTMEventData = Record<string, unknown>;

export interface DataLayerEvent extends GTMEventData {
  event: string;
}

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
    gtag?: (...args: unknown[]) => void;
  }
}
