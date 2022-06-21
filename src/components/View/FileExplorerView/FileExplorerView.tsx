import React from "react";
// import FileExplorer from "../../FileExplorer/FileExplorer";
import "./FileExplorerView.scss";
import FileExplorer from "react-fe";
import FileExplorerApi, { BasicEntry, IEntryWithTypes } from "react-fe/fe-release/FileExplorerApi";
import Api from "../../../api/Api";

// Custom API to display how the component works.
const baseUrl = Api.baseUrlApi + "/file-server";
const api: FileExplorerApi = {
  async getFiles(path: string) {
    localStorage.setItem("FileExplorer.Directory", path);
    const files: IEntryWithTypes[] = await fetch(`${baseUrl}${path}`).then(res => {
      if (res.status === 200) {
        return res.json();
      }
      else {
        throw new Error(`Failed to get files from ${path}`);
      }
    });
    return BasicEntry.buildBulk(files);
  },

  async rename(path: string, newName: string) {
    console.log(`Renaming ${path} to ${newName}`);

    return fetch(`${baseUrl}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "rename",
        newName,
      }),
    }).then(res => {
      if (res.status === 200) {
        return true;
      }
      else {
        throw new Error(`Failed to rename ${path} to ${newName}`);
      }
    });
  },

  async openFile(path: string) {
    window.open(baseUrl + path);
  },

  pathToDataUrl(path: string) {
    return baseUrl + path;
  },

  async uploadFile(path, file, setPercent) {
    console.log(`Uploading ${file.name} to ${path}`);

    return new Promise((resolve, reject) => {
      // Upload file and get the progress.
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${baseUrl}${path}`, true);
      // xhr.setRequestHeader("Content-Type", "multipart/form-data");
      const formData = new FormData();
      formData.append("file", file);
      // Get the progress.
      if (setPercent) {

        xhr.upload.addEventListener("progress", (e) => {
          setPercent(Math.round(e.loaded / e.total * 100));
        }, false);
      }

      xhr.send(formData);

      // Handle the response.
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(true);
          }
          else {
            reject(new Error(`Failed to upload ${file.name} to ${path}`));
          }
        }
      };
    });
  },

  async createFolder(path) {
    console.log(`Creating folder ${path}`);

    return fetch(`${baseUrl}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "create-folder",
      }),
    }).then(async res => {
      if (res.status === 200) {
        return true;
      }
      else {
        throw new Error(await res.text() || `Failed to create folder ${path}`);
      }
    });
  },

  async delete(path) {
    console.log(`Deleting ${path}`);

    return fetch(`${baseUrl}${path}`, {
      method: "DELETE",
    }).then(async res => {
      if (res.status === 200) {
        return true;
      }
      else {
        throw new Error(await res.text() || `Failed to delete ${path}`);
      }
    });
  },
};
interface FileExplorerViewProps { }

export default function FileExplorerView(props: FileExplorerViewProps) {
  const path = localStorage.getItem("FileExplorer.Directory") || "/";
  return (
    <div className="fileExplorerView">
      <FileExplorer api={api} initialPath={path} />
      {/* <FileExplorer directory="/" /> */}
    </div>
  )
}
