export interface Service {
  id: string;
  title: string;
}

export interface Category {
  id: string;
  title: string;
  iconImageUrl: string;
  activeIconImageUrl?: string;
}

export type PickedFile = {
  uri: string;
  type: string;
  name: string;
  size?: number;
  base64Data?: string;
  isBase64?: boolean;
};

export type FormData2Fields = {
  name: string;
};
