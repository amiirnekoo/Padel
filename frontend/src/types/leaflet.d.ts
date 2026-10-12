declare module 'leaflet' {
  export interface LatLngExpression {
    lat?: number;
    lng?: number;
    [key: string]: any;
  }

  export interface MapOptions {
    center?: [number, number] | any;
    zoom?: number;
    zoomControl?: boolean;
    attributionControl?: boolean;
    [key: string]: any;
  }

  export interface Map {
    flyTo(latlng: [number, number], zoom?: number, options?: any): this;
    setView(latlng: [number, number], zoom?: number): this;
    remove(): this;
    invalidateSize(options?: any): this;
    addLayer(layer: any): this;
    removeLayer(layer: any): this;
    [key: string]: any;
  }

  export interface TileLayerOptions {
    subdomains?: string | string[];
    maxZoom?: number;
    attribution?: string;
    [key: string]: any;
  }

  export interface TileLayer {
    addTo(map: Map): this;
    [key: string]: any;
  }

  export interface LayerGroup {
    addTo(map: Map): this;
    clearLayers(): this;
    addLayer(layer: any): this;
    removeLayer(layer: any): this;
    [key: string]: any;
  }

  export interface DivIconOptions {
    className?: string;
    html?: string | HTMLElement | false;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
    [key: string]: any;
  }

  export interface DivIcon {
    [key: string]: any;
  }

  export interface MarkerOptions {
    icon?: any;
    [key: string]: any;
  }

  export interface Marker {
    addTo(map: Map | LayerGroup): this;
    on(type: string, fn: (e: any) => void): this;
    [key: string]: any;
  }

  export function map(element: HTMLElement | string, options?: MapOptions): Map;
  export function tileLayer(urlTemplate: string, options?: TileLayerOptions): TileLayer;
  export function layerGroup(layers?: any[]): LayerGroup;
  export function divIcon(options?: DivIconOptions): DivIcon;
  export function marker(latlng: [number, number], options?: MarkerOptions): Marker;

  export namespace control {
    export function zoom(options?: any): any;
  }

  export namespace L {
    export type Map = Map;
    export type LayerGroup = LayerGroup;
    export type TileLayer = TileLayer;
    export type DivIcon = DivIcon;
    export type Marker = Marker;
  }

  const L: {
    map: typeof map;
    tileLayer: typeof tileLayer;
    layerGroup: typeof layerGroup;
    divIcon: typeof divIcon;
    marker: typeof marker;
    control: typeof control;
    [key: string]: any;
  };

  export default L;
}

declare module 'leaflet/dist/leaflet.css';
