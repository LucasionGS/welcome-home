export interface WebCardCreateModel {
  title: string;
  description?: string;
  url: string;
  image?: string;
  target?: string;
}

export interface WebCardModel {
  id: number;
  title: string;
  description?: string;
  url: string;
  image?: string;
  target?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class WebCard {
  public id: number;
  public title: string;
  public description: string;
  public url: string;
  public image: string = null;
  public target: string;
  public createdAt?: Date;
  public updatedAt?: Date;
  
  constructor(
    model: WebCardModel,
  ) {
    this.id = model.id;
    this.title = model.title;
    this.description = model.description;
    this.url = model.url;
    this.image = model.image;
    this.target = model.target;
    this.createdAt = new Date(model.createdAt);
    this.updatedAt = new Date(model.updatedAt);
  }
}
 