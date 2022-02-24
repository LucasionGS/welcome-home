// import process from "process";

import React from "react";

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

// Generate a random color with seed
export function randomColor(seed: number) {
  var x = Math.abs(Math.sin(seed + 1) % 1) * 0xFFFFFF;
  return "#" + Math.floor(x).toString(16);
}

export function showInEditMode(element: React.ReactNode) {
  return isEditMode() ? element : null;
}