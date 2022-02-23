import React from "react";
import FileExplorer from "../../FileExplorer/FileExplorer";
import "./FileExplorerView.scss";

interface FileExplorerViewProps { }

export default function FileExplorerView(props: FileExplorerViewProps) {
  return (
    <div className="fileExplorerView">
      <FileExplorer directory="/" />
    </div>
  )
}
