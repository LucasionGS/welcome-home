import { Button, Checkbox, Container, Grid, Group, Loader, Menu, Modal, Progress, Text, TextInput } from "@mantine/core";
import { Prism } from "@mantine/prism";
import React, { useState } from "react";
import DirectoryEntry from "./DirectoryEntry";
import fontAwesome from "@fortawesome/fontawesome";
import {
  faFolder,
  faFile,
  faEllipsisV,
  faDownload,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import "./FileExplorer.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { autoScaleByte } from "../../helper";
import Api from "../../api/Api";
import { Dropzone } from '@mantine/dropzone';
import { useForceUpdate } from "@mantine/hooks";
import { PrismSharedProps } from "@mantine/prism/lib/types";

(fontAwesome.library.add as any)(faFolder, faFile, faEllipsisV, faDownload, faX);

interface FileExplorerProps {
  directory?: string;
  storageId?: string;
  disableStorage?: boolean;
}

const filePreview: {
  [extension: string]: [
    "image",
    "text",

    // Programming languages
    "javascript",

    PrismSharedProps["language"],
  ][number];
} = {
  // Images
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  svg: "image",
  ico: "image",

  // Text
  txt: "text",
  log: "text",

  // Programming languages
  js: "javascript",
  ts: "javascript",
  tsx: "jsx",
  jsx: "jsx",

  c: "c",
  cpp: "cpp",
  h: "c",
  hpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  hxx: "cpp",
  cs: "clike",


  // Data files
  json: "json",
  yml: "yaml",
  yaml: "yaml",

  // Sql
  sql: "sql",

  // Markdown
  md: "markdown",

  // CSS
  css: "css",
  scss: "scss",
  less: "less",
  sass: "sass",
  styl: "stylus",
  stylus: "stylus",

  // Python
  py: "python",

  // HTML
  html: "markup",
  htm: "markup",
  php: "clike",

  // Shell
  sh: "bash",
  bash: "bash",
  bat: "bash",

}

export default function FileExplorer(props: FileExplorerProps) {
  const update = useForceUpdate();
  const _idSection = props.storageId ? `.${props.storageId}` : "";
  const id = `FileExplorer.Directory${_idSection}`;

  const root = DirectoryEntry.root((!props.disableStorage ? localStorage.getItem(id) : null) || props.directory || "/");
  const [current, setCurrent] = useState<DirectoryEntry>(null);

  const updateCurrent = async (entry: DirectoryEntry | string) => {
    if (typeof entry === "string") {
      const ent = DirectoryEntry.root(entry);
      await ent.refresh()
      localStorage.setItem(id, entry);
      setCurrent(ent);
      update();
    }
    else if (entry.isDirectory) {
      entry.refresh().then(() => {
        setCurrent(entry);
        update();
        localStorage.setItem(id, entry.getFullPath());
      });
    }
  };

  if (current === null) {
    updateCurrent(root);
  }

  return (
    <Container>
      <FileExplorerContent entry={current} openEntry={updateCurrent} />
    </Container>
  )
}

interface FileExplorerContentProps {
  entry: DirectoryEntry;
  openEntry?: (entry: DirectoryEntry | string) => Promise<void>;
}

function FileExplorerContent(props: FileExplorerContentProps) {
  //#region Explorer options
  const [search, setSearch] = useState("");

  // Hidden files
  const [showHiddenFiles, _setShowHiddenFiles] = useState(
    localStorage.getItem("FileExplorer.showHiddenFiles") === "true" ? true : false
  );
  const setShowHiddenFiles = (show: boolean) => {
    localStorage.setItem("FileExplorer.showHiddenFiles", show ? "true" : "false");
    _setShowHiddenFiles(show);
  };

  //#endregion End of explorer options

  const folderEntry = props.entry || DirectoryEntry.root();
  const visibleEntries = folderEntry.filter(e => {
    let toShow = true;

    if (!showHiddenFiles) {
      toShow = !e.name.startsWith(".");
    }

    // Search
    if (search.length > 0) {
      toShow = e.name.toLowerCase().includes(search.toLowerCase());
    }

    return toShow;
  });
  return (
    <div className="fileExplorerContent">
      <Dropzone
        onDrop={(files => {
          files.forEach(file => {
            const path = (folderEntry.getFullPath() + "/" + file.name).replace(/\/+/g, "/");
            Api.uploadFile(path, file).then(() => {
              props.openEntry(folderEntry);
            }).catch(e => {
              console.error(e);
            });
          });
        })}

        maxSize={Infinity}
      >
        {(status) => (
          <Group position="center" spacing="xl" style={{ minHeight: 100, pointerEvents: 'none' }}>
            <div>
              <Text size="xl" inline>
                Drag files here or click to select files.
              </Text>
              <Text size="sm" color="dimmed" inline mt={7}>
                Attach as many files as you like.
              </Text>
            </div>
          </Group>
        )}
      </Dropzone>
      <Text>{folderEntry.getFullPath()}</Text>
      <Group>
        <Button onClick={() => {
          props.openEntry(folderEntry.parent ?? folderEntry.getParentPath());
        }} >
          Back
        </Button>
        <TextInput type="search" value={search} onChange={(e) => setSearch(e.currentTarget.value)} onKeyDown={(e) => {
          if (e.key === "Enter") {
            const item = visibleEntries[0];
            if (item && search.length > 0) {
              props.openEntry(item);
              setSearch("");
            }
          }
        }} />
        <Button onClick={() => {
          props.openEntry(folderEntry);
        }}>
          Refresh
        </Button>
        <Checkbox checked={showHiddenFiles} onChange={(e) => setShowHiddenFiles(e.currentTarget.checked)} label="Show hidden files" />

      </Group>
      {
        visibleEntries.map(entry => (
          <DirectoryEntryItem
            key={entry.getFullPath()}
            entry={entry}
            openEntry={async e => {
              await props.openEntry(e);
              if (search.length > 0) {
                setSearch("");
              }
            }} />
        ))
      }
    </div>
  )
}

interface FileExplorerItemProps {
  entry: DirectoryEntry;
  openEntry?: (entry: DirectoryEntry | string) => Promise<void>;
}

function DirectoryEntryItem(props: FileExplorerItemProps) {
  const [loading, setLoading] = useState(false);
  const [percent, setPercent] = useState<number>(null);
  const [openedPreview, setOpenedPreview] = useState(false);
  // const [contextMenuOpened, setContextMenuOpened] = useState(false);

  const entry = props.entry;
  const colStyle: React.CSSProperties = {
    border: "1px solid #ccc",
    userSelect: "none",
  }

  return (
    <div>
      <Grid
        className="directoryEntryItem"
        style={{
          margin: "0px",
          // marginTop: "4px",
        }}
        // gutter={16}
        columns={12}
        grow
      >
        <Grid.Col span={3}
          style={colStyle}
        // onContextMenu={(e) => {
        //   e.preventDefault();
        //   setContextMenuOpened(true);
        // }}
        >
          <FilePreviewModel entry={entry} opened={openedPreview} setOpened={setOpenedPreview} />
          {
            !percent && loading ? (
              <Loader />
            ) : (
              <>
                <Menu position="left">
                  {!entry.isDirectory && (entry.getExtension() in filePreview) ? (<Menu.Item icon={<FontAwesomeIcon icon={faDownload} />}
                    onClick={async () => {
                      setOpenedPreview(true);
                    }}
                  >
                    <Text size="sm">Preview</Text>
                  </Menu.Item>) : null}
                  {!entry.isDirectory ? (
                    <Menu.Item icon={<FontAwesomeIcon icon={faDownload} />}
                      onClick={async () => {
                        setLoading(true);
                        const file = await Api.getBlob(entry.getFullPath(), ({ loaded, total }) => {
                          setPercent(loaded / total * 100);
                        });
                        Api.downloadBlob(file, entry.name);
                        setPercent(null);
                        setLoading(false);
                      }}
                    >
                      <Text size="sm">Download</Text>
                    </Menu.Item>
                  ) : null}
                  <Menu.Item icon={<FontAwesomeIcon icon={faX} />} color="red" disabled
                    onClick={async () => {
                      // TODO : Ask for confirmation and delete the file
                    }}
                  >
                    <Text size="sm">Delete</Text>
                  </Menu.Item>
                </Menu>
                &nbsp;
                <div
                  style={{
                    display: "inline"
                  }}
                  className="directoryEntryItemName"
                  // onDoubleClick={() => {
                  onClick={async () => {

                    // Preview if the file is previewable
                    if (entry.getExtension() in filePreview) {
                      return setOpenedPreview(true);
                    }

                    setLoading(true);
                    if (entry.isDirectory) {
                      await props.openEntry(entry)
                    }
                    else {
                      const file = await Api.getBlob(entry.getFullPath(), ({ loaded, total }) => {
                        setPercent(loaded / total * 100);
                      });
                      Api.downloadBlob(file, entry.name);
                      setPercent(null);
                    }
                    setLoading(false);
                  }}
                >
                  <FontAwesomeIcon icon={
                    entry.isDirectory ? faFolder : faFile
                  } display="inline" />
                  &nbsp;
                  <Text style={{
                    display: "inline",
                  }}>{entry.name}</Text>
                </div>
              </>
            )
          }
          {percent ? (
            <Progress value={percent} />
          ) : null}
        </Grid.Col>
        <Grid.Col span={1} style={colStyle}>
          <Text>{autoScaleByte(entry.metadata.size)}</Text>
        </Grid.Col>
        <Grid.Col span={1} style={colStyle}>
          <Text>{(() => {
            const date = new Date(entry.metadata.ctimeMs);
            return date.toLocaleDateString() + " " + date.toLocaleTimeString();
          })()}</Text>
        </Grid.Col>
      </Grid>
    </div >
  )
}

function FilePreviewModel(props: {
  entry: DirectoryEntry,
  opened: boolean,
  setOpened: (value: React.SetStateAction<boolean>) => void
}) {
  const [content, setContent] = useState<React.ReactNode>(undefined);
  if (props.opened && content === undefined) {
    const entry = props.entry;
    const ext = entry.name.split(".").pop() || null;
    if (ext && ext in filePreview) {
      const type = filePreview[ext];

      if (type === "image") {
        setContent(
          <Group position="center">
            <img
            src={Api.baseUrlApi + `/server/preview-file?path=${encodeURIComponent(entry.getFullPath())}`}
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "75vh",
            }}
          />
          </Group>
        );
      }
      else if (type === "text") {

      }
      else {
        Api._get(`/server/preview-file`, {
          path: entry.getFullPath()
        }, res => res.text()).then(data => {
          setContent(
            <Prism
              language={type}
              style={{
                maxHeight: "calc(100vh - 300px)",
                overflowY: "auto",
              }}
            >
              {data}
            </Prism>
          );
        }).catch((err) => {
          console.error(err);

          setContent(
            "<Preview not available>"
          );
        })
      }
    }
    else {
      setContent(
        "Preview not available for this file type"
      );
    }
  }

  return (
    <Modal opened={props.opened} onClose={() => props.setOpened(false)}
      size={1000}
    >
      <Container style={{
        // padding: 8,
        borderBottom: "1px solid #ccc",
      }}>
        <Text>Preview</Text>
      </Container>
      <Container
        style={{
          padding: 8
        }}
      >
        {content}
      </Container>
    </Modal>
  );
}