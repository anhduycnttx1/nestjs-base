export interface IFToken {
  access_token: string;
  refresh_token: string;
}

export interface IFAuthInfo {
  id: string;
  display_name: string;
  avatar: string;
}

export type Url = string;

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
  id: string;
  title: string;
  preview: Url;
  countLike: number;
  countComment: number;
  release_date: Date;
  author: IFAuthInfo;
}

export interface IFPostView {
  id: string;
  title: string;
  content: string;
  countLike: number;
  countComment: number;
  image: Url;
  release_date: Date;
  author: IFAuthInfo;
}

export interface IFCommentList {
  id: string;
  content: string;
  image: Url;
  release_date: Date;
  author: IFAuthInfo;
}
