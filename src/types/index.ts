export interface IFToken {
  access_token: string;
  refresh_token: string;
}

export interface IFAuthInfo {
  id: number;
  display_name: string;
  avatar: Url;
}

export type Url = string | null;

export interface IFRsp<Type> {
  code: number;
  message?: string;
  data?: Type;
}

export interface IFPageRsq<Type> {
  page_index: number;
  item_count: number;
  page_total: number;
  item_total: number;
  content: Type;
}

export interface IFPostList {
  id: number;
  title: string;
  preview: Url;
  countLike: number;
  countComment: number;
  releaseDate: Date;
  author: IFAuthInfo;
}

export interface IFPostView {
  id: number;
  title: string;
  content: string;
  countLike: number;
  countComment: number;
  image: Url;
  release_date: Date;
  author: IFAuthInfo;
}

export interface IFCommentList {
  id: number;
  content: string;
  image: Url;
  release_date: Date;
  author: IFAuthInfo;
}
