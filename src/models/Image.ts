export interface ImageAttributes {
  id: number;
  name: string; // Name the image was uploaded with
  path: string; // Relative to /uploads
  size: number; // Size in bytes
  width: number; // Width in pixels
  height: number; // Height in pixels
}

// export interface ImageCreateModel {
//   name: string;
//   path: string;
//   size: number;
//   width: number;
//   height: number;
// }

export interface ImageModel {
  id: number;
  name: string;
  path: string;
  size: number;
  width: number;
  height: number;

  createdAt?: string;
  updatedAt?: string;
}

export class Image {
  public id: number;
  public name: string;
  public path: string;
  public size: number;
  public width: number;
  public height: number;

  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(
    model: ImageModel,
  ) {
    Object.assign(this, model);

    // Convert to date
    this.createdAt = new Date(model.createdAt);
    this.updatedAt = new Date(model.updatedAt);
  }
}
