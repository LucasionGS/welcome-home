import { isDev } from "../helper";
import { WebCard, WebCardCreateModel, WebCardModel } from "../models/WebCard";
import { Image, ImageModel } from "../models/Image";

namespace Api {

  // Dev mode should use local server
  // Production mode should use current protocol, domain, port, with /api
  export const baseUrl = isDev() ? "http://192.168.0.31:4321"
    : `${window.location.protocol}//${window.location.host}`;
  export const baseUrlApi = `${baseUrl}/api`;
  export const baseUrlUploads = `${baseUrl}/uploads`;

  /**
   * Handle the API response. Throw an error if the response is not valid.
   * @param response Response object
   * @returns 
   */
  async function handleResponse<T = any>(response: Response): Promise<T> {
    if (response.ok) {
      return response.json() as Promise<T>;
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

  //
  // Fetch methods
  //

  export async function _post<T = any>(url: string, body?: any): Promise<T> {
    const bearer = localStorage.getItem("token");
    const res = await fetch(baseUrlApi + url, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": bearer ? `Bearer ${bearer}` : null
      },
      method: "POST",
      body: body ? JSON.stringify(body) : null
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

  export async function _get<T = any>(url: string, params: { [key: string]: string | number } = {}): Promise<T> {
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

    return handleResponse<T>(res);
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


  //
  // Api endpoints
  //

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
    wcs.sort((a, b) => a.position - b.position);
  }

  export function submitWebCardsOrder(wcs: WebCard[]) {
    const wcIds = wcs.map(wc => wc.id);
    return _post("/webcard/order", {
      ids: wcIds
    });
  }

  export async function updateWebCard(wc: WebCard): Promise<WebCard> {
    return await _put<WebCardModel>("/webcard/" + wc.id, wc).then(wc => new WebCard(wc));
  }

  export async function deleteWebCard(id: number): Promise<void> {
    return await _delete<void>("/webcard/" + id);
  }
}

export default Api;