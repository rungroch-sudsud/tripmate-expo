export interface ProfileFormData {
  fullName: string;
  nickname: string;
  occupation:string,
  age: string;
  gender: string;
  customGender: string;
  email: string;
  facebookUrl: string;
  lineId: string;
  travelInterests: string[];
  favouriteDestinations: string[];
  travelStyles?: string[];
}