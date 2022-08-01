import Api from "../api/Api";

export interface ActionCreateModel {
  title: string;
  description: string;
  command: string;
  image: string;
}

export interface ActionModel {
  id: number;
  title: string;
  description: string;
  command: string;
  image: string;

  createdAt?: string;
  updatedAt?: string;
}

export class Action {
  public id: number;
  public title: string;
  public description: string;
  public command: string;
  public image: string;

  public createdAt?: Date;
  public updatedAt?: Date;
  
  constructor(
    model: ActionModel,
  ) {
    Object.assign(this, model);

    // Convert to date
    this.createdAt = new Date(model.createdAt);
    this.updatedAt = new Date(model.updatedAt);
  }

  getImageUrl() {
    const url = this.image;
    if (url?.startsWith("/uploads")) {
      return `${Api.baseUrl}${url}`;
    }
    return url;
  }
}