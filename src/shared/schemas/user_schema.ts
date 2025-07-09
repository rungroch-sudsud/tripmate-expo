export interface User {
  fullname: string;
  nickname: string;
  email: string;
  age: number;
  gender: string;
  facebookUrl: string;
  lineId: string;
  destinations: string[];
  travelStyles: string[];
  profileImageUrl?: string;
}