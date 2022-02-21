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
    )  + "edit";
  }
}