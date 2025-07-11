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

export interface FormDataFields {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  selectedOptions: string[];
  attachments: number;
  details: string;
}

export type FormData2Fields = {
  name: string;
};


export interface Trip {
  id: string;
  status: string;
  name: string;
  includedServices: string[];
  destinations: string[];
  endDate: string;
  maxParticipants: number;
  tripOwnerId: string;
  groupAtmosphere: string;
  startDate: string;
  participants: any[];
  travelStyles: string[];
  tripCoverImageUrl: string;
  pricePerPerson: number;
  detail: string;
  tripOwner: any;
}
