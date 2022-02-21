export interface WebCardCreateModel {
  title: string;
  description?: string;
  url: string;
  image?: string;
  target?: string;
  checkAvailable?: boolean;
  position?: number;
  category?: string;
}

export interface WebCardModel {
  id: number;
  title: string;
  description?: string;
  url: string;
  image?: string;
  target?: string;
  checkAvailable?: boolean;
  position?: number;
  category?: string;

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
  public checkAvailable: boolean;
  public position: number;
  public category: string;

  public createdAt?: Date;
  public updatedAt?: Date;
  
  constructor(
    model: WebCardModel,
  ) {
    Object.assign(this, model);

    // Convert to date
    this.createdAt = new Date(model.createdAt);
    this.updatedAt = new Date(model.updatedAt);
  }
}
 
export interface WebCardCategory {
  category: string;
  webcards: WebCard[];
}