// import process from "process";

export function isDev() {
  if (process.env.NODE_ENV === "development") {
    return true;
  }
  return false;
}

export function isProd() {
  return !isDev();
}

export function isEditMode() {
  return window.location.pathname.endsWith("/edit");
}

export function toggleEditMode() {
  if (isEditMode()) {
    window.location.pathname = window.location.pathname.replace(/\/edit$/, "");
  }
  else {
    window.location.pathname = window.location.pathname + (
      window.location.pathname.endsWith("/") ? "" : "/"
    ) + "edit";
  }
}

export function autoScaleByte(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }
  if (bytes < 1024 * 1024 * 1024 * 1024) {
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }
  if (bytes < 1024 * 1024 * 1024 * 1024 * 1024) {
    return `${(bytes / 1024 / 1024 / 1024 / 1024).toFixed(2)} TB`;
  }
  return `${(bytes / 1024 / 1024 / 1024 / 1024 / 1024).toFixed(2)} PB`;
}