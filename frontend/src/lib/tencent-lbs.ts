/**
 * 腾讯地图能力封装
 * - JavaScript GL API：交互式地图展示
 * - WebService API：地址解析、POI 搜索、静态图等
 */

const TENCENT_MAP_KEY =
  (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_TENCENT_MAP_KEY || '';

const BASE_URL = 'https://apis.map.qq.com';
const GLJS_URL = 'https://map.qq.com/api/gljs';
const GLJS_VERSION = '1.exp';

let jsonpCallbackCounter = 0;
let glApiLoaded = false;
let glApiLoading: Promise<void> | null = null;

export const LBS_ERROR_CODES = {
  SUCCESS: 0,
  UNAUTHORIZED_REFERER: 110,
  UNAUTHORIZED_IP: 112,
  WEBSERVICE_NOT_ENABLED: 120,
  FEATURE_NOT_AUTHORIZED: 121,
  QUOTA_EXCEEDED: 122,
  KEY_DISABLED: 311,
} as const;

export class LBSError extends Error {
  constructor(public readonly status: number, message: string, public readonly requestSource?: string) {
    super(message);
    this.name = 'LBSError';
  }

  getSolution(): string {
    switch (this.status) {
      case LBS_ERROR_CODES.UNAUTHORIZED_REFERER:
        return `当前域名未授权，请将域名加入腾讯地图 Key 白名单：${this.requestSource || window.location.hostname}`;
      case LBS_ERROR_CODES.WEBSERVICE_NOT_ENABLED:
        return '请在腾讯位置服务控制台启用 WebService API。';
      case LBS_ERROR_CODES.QUOTA_EXCEEDED:
        return '调用配额不足，请提高额度或降低请求频率。';
      case LBS_ERROR_CODES.KEY_DISABLED:
        return '当前 Key 已停用，请在控制台检查状态。';
      default:
        return '请检查请求参数、Key 配置或网络连通性。';
    }
  }
}

export interface Location {
  lat: number;
  lng: number;
}

export interface AdInfo {
  nation?: string;
  province?: string;
  city?: string;
  district?: string;
  adcode?: number | string;
}

export interface POI {
  id: string;
  title: string;
  address: string;
  category?: string;
  location: Location;
  ad_info?: AdInfo;
  _distance?: number;
}

export interface SearchPlaceOptions {
  boundary: string;
  pageSize?: number;
  pageIndex?: number;
  filter?: string;
  orderby?: string;
}

export interface SearchPlaceResponse {
  status: number;
  message: string;
  count: number;
  data: POI[];
}

export interface GeocodeResponse {
  status: number;
  message: string;
  result: {
    location: Location;
    address_components: {
      province: string;
      city: string;
      district: string;
      street: string;
      street_number: string;
    };
    ad_info: {
      adcode: string;
    };
  };
}

export interface ReverseGeocodeResponse {
  status: number;
  message: string;
  result: {
    address: string;
    address_component: {
      nation: string;
      province: string;
      city: string;
      district: string;
      street: string;
      street_number: string;
    };
    ad_info: AdInfo;
    pois?: POI[];
  };
}

export interface ClientOptions {
  key?: string;
  timeout?: number;
}

export interface MapOptions {
  center: Location;
  zoom?: number;
  pitch?: number;
  rotation?: number;
}

export interface MarkerStyleOptions {
  width?: number;
  height?: number;
  src?: string;
  anchor?: { x: number; y: number };
}

export interface MarkerGeometry {
  id: string;
  styleId?: string;
  position: Location;
  properties?: Record<string, unknown>;
}

export interface InfoWindowOptions {
  content: string;
  position: Location;
  offset?: { x: number; y: number };
}

export interface StaticMapMarker {
  position: Location;
  label?: string;
  color?: 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'orange';
}

export interface StaticMapOptions {
  center?: Location;
  zoom?: number;
  size: {
    width: number;
    height: number;
  };
  maptype?: 'roadmap' | 'satellite' | 'hybrid';
  scale?: 1 | 2;
  format?: 'png' | 'png8' | 'gif' | 'jpg';
  markers?: StaticMapMarker[];
}

declare global {
  interface Window {
    TMap: {
      LatLng: new (lat: number, lng: number) => TMapLatLng;
      Map: new (container: HTMLElement, options: TMapMapOptions) => TMapInstance;
      MultiMarker: new (options: TMapMultiMarkerOptions) => TMapMultiMarker;
      MarkerStyle: new (options: TMapMarkerStyleOptions) => TMapMarkerStyle;
      InfoWindow: new (options: TMapInfoWindowOptions) => TMapInfoWindow;
    };
  }
}

interface TMapLatLng {
  lat: number;
  lng: number;
}

interface TMapMapOptions {
  center: TMapLatLng;
  zoom?: number;
  pitch?: number;
  rotation?: number;
}

interface TMapInstance {
  setCenter(center: TMapLatLng): void;
  setZoom(zoom: number): void;
  destroy(): void;
}

interface TMapMarkerStyleOptions {
  width?: number;
  height?: number;
  src?: string;
  anchor?: { x: number; y: number };
}

interface TMapMarkerStyle {}

interface TMapMultiMarkerOptions {
  map: TMapInstance;
  styles?: Record<string, TMapMarkerStyle>;
  geometries?: TMapMarkerGeometry[];
}

interface TMapMarkerGeometry {
  id: string;
  styleId?: string;
  position: TMapLatLng;
  properties?: Record<string, unknown>;
}

interface TMapEvent {
  geometry?: {
    position: TMapLatLng;
  };
}

interface TMapMultiMarker {
  on(event: string, handler: (evt: TMapEvent) => void): void;
}

interface TMapInfoWindowOptions {
  map: TMapInstance;
  position: TMapLatLng;
  content?: string;
  offset?: { x: number; y: number };
}

interface TMapInfoWindow {
  open(): void;
  setPosition(position: TMapLatLng): void;
}

function assertMapKey(key: string) {
  if (!key) {
    throw new LBSError(-1000, '未检测到腾讯地图 Key。请在前端环境变量中配置 VITE_TENCENT_MAP_KEY。');
  }
}

export async function loadTMapGL(options?: { key?: string; libraries?: string }): Promise<void> {
  if (glApiLoaded && window.TMap) {
    return;
  }

  if (glApiLoading) {
    return glApiLoading;
  }

  glApiLoading = new Promise((resolve, reject) => {
    const key = options?.key ?? TENCENT_MAP_KEY;
    try {
      assertMapKey(key);
    } catch (error) {
      glApiLoading = null;
      reject(error);
      return;
    }

    let scriptUrl = `${GLJS_URL}?v=${GLJS_VERSION}&key=${key}`;
    if (options?.libraries) {
      scriptUrl += `&libraries=${options.libraries}`;
    }

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.charset = 'utf-8';

    script.onload = () => {
      if (window.TMap) {
        glApiLoaded = true;
        resolve();
      } else {
        glApiLoading = null;
        reject(new LBSError(-3, '腾讯地图 GL API 加载失败：TMap 对象未定义。'));
      }
    };

    script.onerror = () => {
      glApiLoading = null;
      reject(new LBSError(-2, '腾讯地图 GL API 脚本加载失败，请检查网络和 Key。'));
    };

    document.head.appendChild(script);
  });

  return glApiLoading;
}

export function isGLApiLoaded(): boolean {
  return glApiLoaded && !!window.TMap;
}

export function createMap(container: HTMLElement | string, options: MapOptions): TMapInstance {
  if (!isGLApiLoaded()) {
    throw new LBSError(-3, '请先调用 loadTMapGL() 再创建地图。');
  }

  const containerEl = typeof container === 'string' ? document.getElementById(container) : container;

  if (!containerEl) {
    throw new LBSError(-4, `未找到地图容器：${container}`);
  }

  const center = new window.TMap.LatLng(options.center.lat, options.center.lng);
  return new window.TMap.Map(containerEl, {
    center,
    zoom: options.zoom ?? 14,
    pitch: options.pitch ?? 0,
    rotation: options.rotation ?? 0,
  });
}

export function createMarkerLayer(map: TMapInstance, markers: MarkerGeometry[], style?: MarkerStyleOptions): TMapMultiMarker {
  if (!isGLApiLoaded()) {
    throw new LBSError(-3, '请先调用 loadTMapGL()。');
  }

  const styles: Record<string, TMapMarkerStyle> = {
    default: new window.TMap.MarkerStyle({
      width: style?.width ?? 25,
      height: style?.height ?? 35,
      src: style?.src,
      anchor: style?.anchor ?? { x: 12, y: 35 },
    }),
  };

  const geometries = markers.map((marker) => ({
    id: marker.id,
    styleId: marker.styleId ?? 'default',
    position: new window.TMap.LatLng(marker.position.lat, marker.position.lng),
    properties: marker.properties,
  }));

  return new window.TMap.MultiMarker({
    map,
    styles,
    geometries,
  });
}

export function createInfoWindow(map: TMapInstance, options: InfoWindowOptions): TMapInfoWindow {
  if (!isGLApiLoaded()) {
    throw new LBSError(-3, '请先调用 loadTMapGL()。');
  }

  return new window.TMap.InfoWindow({
    map,
    position: new window.TMap.LatLng(options.position.lat, options.position.lng),
    content: options.content,
    offset: options.offset ?? { x: 0, y: -32 },
  });
}

export function addMarkerWithInfo(
  map: TMapInstance,
  position: Location,
  title: string,
  content?: string,
): { markerLayer: TMapMultiMarker; infoWindow: TMapInfoWindow } {
  const markerLayer = createMarkerLayer(map, [{ id: `marker-${Date.now()}`, position, properties: { title } }]);
  const infoWindow = createInfoWindow(map, {
    content: content ?? `<div style="padding:8px;"><strong>${title}</strong></div>`,
    position,
  });

  markerLayer.on('click', (evt) => {
    if (evt.geometry) {
      infoWindow.setPosition(evt.geometry.position);
      infoWindow.open();
    }
  });

  infoWindow.open();
  return { markerLayer, infoWindow };
}

function jsonpRequest<T>(url: string, timeout = 10000): Promise<T> {
  return new Promise((resolve, reject) => {
    const callbackName = `__tencentLbsCallback_${Date.now()}_${++jsonpCallbackCounter}`;
    const separator = url.includes('?') ? '&' : '?';
    const jsonpUrl = `${url}${separator}output=jsonp&callback=${callbackName}`;

    const script = document.createElement('script');
    script.src = jsonpUrl;
    script.async = true;

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new LBSError(-1, `腾讯地图请求超时（${timeout}ms）。`));
    }, timeout);

    const cleanup = () => {
      clearTimeout(timeoutId);
      delete (window as unknown as Record<string, unknown>)[callbackName];
      script.remove();
    };

    (window as unknown as Record<string, unknown>)[callbackName] = (data: T & { status: number; message: string }) => {
      cleanup();
      if (data.status !== 0) {
        reject(new LBSError(data.status, data.message));
      } else {
        resolve(data);
      }
    };

    script.onerror = () => {
      cleanup();
      reject(new LBSError(-2, '腾讯地图网络请求失败。'));
    };

    document.head.appendChild(script);
  });
}

export class TencentLBSClient {
  private key: string;
  private timeout: number;

  constructor(options: ClientOptions = {}) {
    this.key = options.key ?? TENCENT_MAP_KEY;
    this.timeout = options.timeout ?? 10000;

    assertMapKey(this.key);
  }

  private buildUrl(endpoint: string, params: Record<string, string | number | undefined>): string {
    const url = new URL(endpoint, BASE_URL);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) {
        url.searchParams.append(k, String(v));
      }
    });
    url.searchParams.append('key', this.key);
    return url.toString();
  }

  private async request<T>(endpoint: string, params: Record<string, string | number | undefined>): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    return jsonpRequest<T>(url, this.timeout);
  }

  async searchPlace(keyword: string, options: SearchPlaceOptions): Promise<SearchPlaceResponse> {
    return this.request<SearchPlaceResponse>('/ws/place/v1/search', {
      keyword,
      boundary: options.boundary,
      page_size: options.pageSize,
      page_index: options.pageIndex,
      filter: options.filter,
      orderby: options.orderby,
    });
  }

  async geocode(address: string): Promise<GeocodeResponse> {
    return this.request<GeocodeResponse>('/ws/geocoder/v1/', { address });
  }

  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResponse> {
    return this.request<ReverseGeocodeResponse>('/ws/geocoder/v1/', { location: `${lat},${lng}`, get_poi: 1 });
  }

  getStaticMapUrl(options: StaticMapOptions): string {
    const url = new URL('/ws/staticmap/v2/', BASE_URL);

    url.searchParams.append('size', `${options.size.width}*${options.size.height}`);
    url.searchParams.append('key', this.key);

    if (options.center) {
      url.searchParams.append('center', `${options.center.lat},${options.center.lng}`);
    }

    if (options.zoom !== undefined) {
      url.searchParams.append('zoom', String(options.zoom));
    }

    if (options.maptype) {
      url.searchParams.append('maptype', options.maptype);
    }

    if (options.scale) {
      url.searchParams.append('scale', String(options.scale));
    }

    if (options.format) {
      url.searchParams.append('format', options.format);
    }

    if (options.markers?.length) {
      const markerStrings = options.markers.map((marker) => {
        const parts: string[] = [];
        if (marker.color) parts.push(`color:${marker.color}`);
        if (marker.label) parts.push(`label:${marker.label}`);
        parts.push(`${marker.position.lat},${marker.position.lng}`);
        return parts.join('|');
      });
      url.searchParams.append('markers', markerStrings.join(';'));
    }

    return url.toString();
  }
}

export function createClient(options?: ClientOptions): TencentLBSClient {
  return new TencentLBSClient(options);
}

const defaultClient = TENCENT_MAP_KEY ? createClient() : null;
export default defaultClient;
