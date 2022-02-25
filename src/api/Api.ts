import { isDev } from "../helper";
import { WebCard, WebCardCreateModel, WebCardModel } from "../models/WebCard";
import { ImageModel } from "../models/Image";
import { DirectoryEntryData } from "../components/FileExplorer/DirectoryEntry";

namespace Api {

  // Dev mode should use local server
  // Production mode should use current protocol, domain, port, with /api
  export const baseUrl = isDev() ? "http://192.168.0.31:3000"
    // export const baseUrl = isDev() ? "http://localhost:4321"
    : `${window.location.protocol}//${window.location.host}`;
  export const baseUrlApi = `${baseUrl}/api`;
  export const baseUrlUploads = `${baseUrl}/uploads`;

  /**
   * Handle the API response. Throw an error if the response is not valid.
   * @param response Response object
   * @returns 
   */
  async function handleResponse<T = any>(response: Response, handleOk?: HandleOk<T>): Promise<T> {
    if (response.ok) {
      return handleOk ? handleOk(response) : response.json() as Promise<T>;
    }
    else if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    else if (response.status === 403) {
      throw new Error("Forbidden");
    }
    else if (response.status === 404) {
      throw new Error("Not Found");
    }
    else if (response.status === 500) {
      throw new Error("Internal Server Error");
    }
    else {
      throw new Error("Unknown error");
    }
  }

  type HandleOk<T = any> = (response: Response) => Promise<T>;

  //
  // Fetch methods
  //

  export async function _post<T = any>(url: string, body?: any): Promise<T> {
    const isFormData = body instanceof FormData;
    const bearer = localStorage.getItem("token");
    const res = await fetch(baseUrlApi + url, {
      headers: {
        "Content-Type": isFormData ? undefined : "application/json",
        "Accept": "application/json",
        "Authorization": bearer ? `Bearer ${bearer}` : null
      },
      method: "POST",
      body: isFormData ? body : (body ? JSON.stringify(body) : null)
    });

    return handleResponse<T>(res);
  }

  export async function _put<T = any>(url: string, body?: any): Promise<T> {
    const bearer = localStorage.getItem("token");
    const res = await fetch(baseUrlApi + url, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": bearer ? `Bearer ${bearer}` : null
      },
      method: "PUT",
      body: body ? JSON.stringify(body) : null
    });

    return handleResponse<T>(res);
  }

  export async function _get<T = any>(url: string, params: { [key: string]: string | number } = {}, handleOk?: HandleOk<T>): Promise<T> {
    const bearer = localStorage.getItem("token");
    const param = new URLSearchParams();
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        param.append(key, String(params[key]));
      }
    }
    const res = await fetch(baseUrlApi + url + "?" + param.toString(), {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": bearer ? `Bearer ${bearer}` : null
      },
      method: "GET",
    });

    return handleOk ? handleOk(res) : handleResponse<T>(res);
  }

  export async function _delete<T = any>(url: string, params: { [key: string]: string | number } = {}): Promise<T> {
    const bearer = localStorage.getItem("token");
    const param = new URLSearchParams();
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        param.append(key, String(params[key]));
      }
    }
    const res = await fetch(baseUrlApi + url + "?" + param.toString(), {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": bearer ? `Bearer ${bearer}` : null
      },
      method: "DELETE",
    });

    return handleResponse<T>(res);
  }

  export async function uploadImage(file: File) {
    const data = new FormData();
    data.append("image", file);
    const response = await fetch(baseUrlApi + "/image", {
      method: "POST",
      body: data,
    });
    const img = await handleResponse<ImageModel>(response);
    if (img) {
      return {
        url: Api.baseUrlUploads + "/" + img.path,
        image: img,
      };
    }
    return null;
  }

  // export async function _getBlob(url: string, params: { [key: string]: string | number } = {}): Promise<Blob> {
  //   const bearer = localStorage.getItem("token");
  //   const param = new URLSearchParams();
  //   for (const key in params) {
  //     if (params.hasOwnProperty(key)) {
  //       param.append(key, String(params[key]));
  //     }
  //   }
  //   const res = await fetch(baseUrlApi + url + "?" + param.toString(), {
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Accept": "application/json",
  //       "Authorization": bearer ? `Bearer ${bearer}` : null
  //     },
  //     method: "GET",
  //   });

  //   return handleResponse(res, (response) => {
  //     return response.blob();
  //   });
  // }

  export async function getBlob(fileUrl: string, onProgress?: (data: {
    loaded: number,
    total: number
  }) => void): Promise<Blob> {
    const bearer = localStorage.getItem("token");
    const res = await fetch(`${baseUrlApi}/server/file?path=` + fileUrl, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": bearer ? `Bearer ${bearer}` : null
      },
      method: "GET",
    })
      .then(response => {
        // large snippet from https://github.com/AnthumChris/fetch-progress-indicators/blob/master/fetch-basic/supported-browser.js
        if (!response.ok) {
          throw Error(response.status + " " + response.statusText)
        }

        if (!response.body) {
          throw Error("ReadableStream not yet supported in this browser.")
        }

        // to access headers, server must send CORS header "Access-Control-Expose-Headers: content-encoding, content-length x-file-size"
        // server must send custom x-file-size header if gzip or other content-encoding is used
        const contentEncoding = response.headers.get("content-encoding");
        const contentLength = response.headers.get(contentEncoding ? "x-file-size" : "content-length");
        if (contentLength === null) {
          throw Error("Response size header unavailable");
        }

        const total = parseInt(contentLength, 10);
        let loaded = 0;

        return new Response(
          new ReadableStream({
            start(controller) {
              const reader = response.body.getReader();

              read();
              function read() {
                reader.read().then(({ done, value }) => {
                  if (done) {
                    controller.close();
                    return;
                  }
                  loaded += value.byteLength;
                  onProgress({ loaded, total });
                  controller.enqueue(value);
                  read();
                }).catch(error => {
                  console.error(error);
                  controller.error(error)
                })
              }
            }
          })
        );
      })
      .then(response => response.blob())

    // return handleResponse(res, (response) => {
    //   return response.blob();
    // });
    return res;
  }

  export function downloadBlob(blob: Blob, filename: string) {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  //
  // Api endpoints
  //

  export async function setFavicon(image: File) {
    const data = new FormData();
    data.append("image", image);
    const response = await fetch(baseUrl + "/favicon.ico", {
      method: "POST",
      body: data,
    });
    const img = await handleResponse<ImageModel>(response);
    if (img) {
      return {
        url: Api.baseUrlUploads + "/" + img.path,
        image: img,
      };
    }
    return null;
  }

  interface SiteOption {
    key: string;
    value: string;
  }

  export async function getOption(key: string) {
    return await _get<SiteOption>("/option/" + key);
  }

  export async function setOption(key: string, value: string) {
    return await _post<SiteOption>("/option/" + key, { value });
  }

  export async function getWebCards(): Promise<WebCard[]> {
    return await _get<WebCardModel[]>("/webcard").then(wcs => wcs.map(wc => new WebCard(wc)));
  }

  export async function createWebCard(wc: WebCardCreateModel): Promise<WebCard> {
    return await _post<WebCardModel>("/webcard", wc).then(wc => new WebCard(wc));
  }

  export function sortWebCards(wcs: WebCard[]) {
    return wcs.sort((a, b) => a.position - b.position);
  }

  export function submitWebCardsOrder(wcs: WebCard[]) {
    const wcIds = wcs.map(wc => wc.id);
    return _post<{
      success: boolean;
    }>("/webcard/order", {
      ids: wcIds
    });
  }

  export async function updateWebCard(wc: WebCard): Promise<WebCard> {
    return await _put<WebCardModel>("/webcard/" + wc.id, wc).then(wc => new WebCard(wc));
  }

  export async function deleteWebCard(id: number): Promise<void> {
    return await _delete<void>("/webcard/" + id);
  }

  export interface SqlDialects {
    mysql: {
      host: string;
      port: number;
      username: string;
      password: string;
      database: string;
    },

    sqlite: {
      storage: string;
      /**
       * Only `true` if no config file exists.
       */
      __defaultConfig?: boolean;
    },
  }

  export async function createConfig<T extends keyof SqlDialects>(dialect: T, config: SqlDialects[T]) {
    return await _post("/config", {
      dialect,
      config
    });
  }

  export async function getConfig<T extends keyof SqlDialects = keyof SqlDialects>() {
    return await _get<SqlDialects[T]>("/config");
  }

  export async function login(username: string, password: string) {
    return await _post<string>("/user/login", { username, password });
  }

  export async function getUptime() {
    return await _get<{
      uptime: number;
    }>("/server/uptime");
  }

  export async function getSystemStats() {
    const res = await _get<SystemStatsModule.SystemStats>("/server/system-stats");
    return res;
  }

  export async function getDirectory(path: string) {
    return _get<DirectoryEntryData[]>("/server/directory", { path });
  }

  export async function getFile(path: string) {
    return getBlob(path);
  }

  export async function uploadFile(path: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);
    return _post<{
      success: boolean,
      err?: string,
    }>("/server/file", formData);
  }

  // Docker specific endpoints
  export namespace Docker {
    export async function isDocker() {
      return await _get<{
        docker: boolean;
      }>("/server/is-docker");
    }

    /**
     * Update and rebuild the server from GitHub.
     */
    export async function update() {
      return await _post<void>("/docker/update");
    }
  }
}

export default Api;

// Other types
export declare module SystemStatsModule {

  export interface Cpu {
    main: number;
    cores: number[];
    max: number;
    socket: number[];
    chipset?: any;
  }

  export interface Memory {
    total: number;
    free: number;
    used: number;
    active: number;
    available: number;
    buffers: number;
    cached: number;
    slab: number;
    buffcache: number;
    swaptotal: number;
    swapused: number;
    swapfree: number;
  }

  export interface OperatingSystem {
    platform: string;
    distro: string;
    release: string;
    codename: string;
    kernel: string;
    arch: string;
    hostname: string;
    fqdn: string;
    codepage: string;
    logofile: string;
    serial: string;
    build: string;
    servicepack: string;
    uefi: boolean;
  }

  export interface FileSystem {
    fs: string;
    type: string;
    size: any;
    used: any;
    available: any;
    use: number;
    mount: string;
  }

  export interface Thread {
    load: number;
    loadUser: number;
    loadSystem: number;
    loadNice: number;
    loadIdle: number;
    loadIrq: number;
    rawLoad: number;
    rawLoadUser: number;
    rawLoadSystem: number;
    rawLoadNice: number;
    rawLoadIdle: number;
    rawLoadIrq: number;
  }

  export interface Load {
    avgLoad: number;
    currentLoad: number;
    currentLoadUser: number;
    currentLoadSystem: number;
    currentLoadNice: number;
    currentLoadIdle: number;
    currentLoadIrq: number;
    rawCurrentLoad: number;
    rawCurrentLoadUser: number;
    rawCurrentLoadSystem: number;
    rawCurrentLoadNice: number;
    rawCurrentLoadIdle: number;
    rawCurrentLoadIrq: number;
    cpus: Thread[];
  }

  export interface Process {
    pid: number;
    parentPid: number;
    name: string,
    cpu: number;
    cpuu: number;
    cpus: number;
    mem: number;
    priority: number;
    memVsz: number;
    memRss: number;
    nice: number;
    started: string,
    state: string;
    tty: string;
    user: string;
    command: string;
    params: string;
    path: string;
  }

  export interface ProcessesData {
    all: number;
    running: number;
    blocked: number;
    sleeping: number;
    unknown: number;
    list: Process[];
  }

  export interface SystemStats {
    cpu: SystemStatsModule.Cpu;
    mem: SystemStatsModule.Memory;
    os: SystemStatsModule.OperatingSystem;
    fs: SystemStatsModule.FileSystem[];
    load: SystemStatsModule.Load;
    processes: ProcessesData;
  }
}


