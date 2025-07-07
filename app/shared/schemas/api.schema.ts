export interface ApiResponse {
  data: {
    id: string;
    title: string;
    iconImageUrl: string;
    activeIconImageUrl?: string;
  }[];
}

export interface ServicesResponse {
  data: {
    id: string;
    title: string;
  }[];
}
