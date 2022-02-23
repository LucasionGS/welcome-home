import Api from "../../api/Api";

export default class DirectoryEntry extends Array<DirectoryEntry> {
  constructor(
    public name: string,
    /**
     * If children is an `Array<DirectoryEntry>`, this is a directory.  
     * If children is `null`, this is a file.
     */
    children: DirectoryEntry[],
    public metadata: DirectoryEntryData["metadata"],
  ) {
    super(
      ...(Array.isArray(children) ? children : []),
    );

    this.isDirectory = Array.isArray(children);
  }

  public isDirectory: boolean;
  public parent: DirectoryEntry = null;
  public locked = true;

  public getExtension(): string {
    return this.name.split(".").pop() || "";
  }

  public static fromMetadata(metadata: DirectoryEntryData): DirectoryEntry {
    return new DirectoryEntry(
      metadata.name,
      metadata.isDirectory ? [] : null,
      metadata.metadata,
    );
  }

  /**
   * 
   * @param rootPath Path to use as root.
   * @param unlockRoot If true, the root will be unlocked. This means that the root can be dynamically changed below it's initial path.
   * @returns 
   */
  public static root(rootPath: string = "/", unlockRoot: boolean = false): DirectoryEntry {
    const entry = new DirectoryEntry(rootPath, [], null);
    entry.locked = !unlockRoot;
    return entry;
  }

  public getParentPath(): string {
    if (this.parent) {
      return this.parent.getFullPath() || "/";
    }
    else {
      const _parts = this.getFullPath().split("/");
      _parts.pop();
      return _parts.join("/") || "/";
    }
  }
  
  public getFullPath(): string {
    const sep = "/";
    const regex = new RegExp(`\\${sep}+`, "g");
    return (this.parent ? `${sep}${this.parent.getFullPath()}${sep}${this.name}` : `${sep}${this.name}`).replace(regex, "/");
  }

  public static async fetchDirectory(directory: string) {
    return Api.getDirectory(directory);
  }

  public async refresh() {
    const self = this;
    return DirectoryEntry.fetchDirectory(this.getFullPath()).then(
      entries => {
        this.splice(0, this.length, ...entries.map(a => {
          const entry = DirectoryEntry.fromMetadata(a);
          entry.parent = self;
          return entry;
        }));
      }
    );
  }

  public add(entry: DirectoryEntryData): DirectoryEntry;
  public add(...entries: DirectoryEntryData[]): DirectoryEntry;
  public add(...entries: DirectoryEntryData[]): DirectoryEntry {
    const newEntries = entries.map(DirectoryEntry.fromMetadata);
    this.push(...newEntries);
    return this;
  }
}

export interface DirectoryEntryData {
  name: string;
  isDirectory: boolean,
  isFile: boolean,
  metadata: {
    dev: number;
    mode: number;
    nlink: number;
    uid: number;
    gid: number;
    rdev: number;
    blksize: number;
    ino: number;
    size: number;
    blocks: number;
    atimeMs: number;
    mtimeMs: number;
    ctimeMs: number;
    birthtimeMs: number;
    atime: string;
    mtime: string;
    ctime: string;
    birthtime: string;
  }
}