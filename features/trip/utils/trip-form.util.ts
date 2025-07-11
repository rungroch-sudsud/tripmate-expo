import { convertDate } from '@/shared/utils/date.util';
import { MAX_TRIP_NAME_WORDS } from '../constants/trip-form.constant';
import {
  Category,
  FormData2Fields,
  FormDataFields,
  PickedFile,
  Service,
} from '../schemas/trip-form.schema';

export function validateTripName(formData: FormData2Fields) {
  const wordCount = formData.name.trim().split(/\s+/).length;

  if (!formData.name.trim()) {
    return 'กรุณาใส่ชื่อทริป';
  }
  if (wordCount > MAX_TRIP_NAME_WORDS) {
    return `ชื่อทริปต้องไม่เกิน ${MAX_TRIP_NAME_WORDS} คำ`;
  }
  return '';
}

export function isServiceChecked(id: string, selectedServices: string[]) {
  return selectedServices.includes(id);
}

export function createTripFromFormData({
  formData,
  formData2,
  selectedDestinations,
  maxParticipants,
  pricePerPerson,
  includedServices,
  userInfo,
  categories,
  selectedTravelStyles,
  pickedFile2,
}: {
  formData: FormDataFields;
  formData2: FormData2Fields;
  selectedDestinations: string[];
  maxParticipants: number;
  pricePerPerson: number;
  includedServices: Service[];
  userInfo: any;
  categories: Category[];
  selectedTravelStyles: string[];
  pickedFile2: PickedFile;
}) {
  const includedServiceIds = includedServices.map((service) => service.id);
  const trip = {
    id: 'preview-trip',
    name: formData2.name,
    destinations: selectedDestinations,
    startDate: convertDate(formData.startDate),
    endDate: convertDate(formData.endDate),
    maxParticipants: parseInt(maxParticipants.toString()) || 0,
    participants: [],
    pricePerPerson: pricePerPerson,
    detail: formData.details,
    groupAtmosphere: formData.description,
    includedServices: includedServices
      .filter((service) => isServiceChecked(service.id, includedServiceIds))
      .map((service) => service.title),
    travelStyles: categories
      .filter((category) => selectedTravelStyles.includes(category.id))
      .map((category) => category.title),
    tripCoverImageUrl: pickedFile2?.uri,
    tripOwner: {
      id: userInfo?.userId,
      displayName: userInfo?.fullname,
      firstName: userInfo?.fullname?.split(' ')[0] || '',
      lastName: userInfo?.fullname?.split(' ').slice(1).join(' ') || '',
      profileImageUrl:
        userInfo?.profileImageUrl || 'https://via.placeholder.com/40',
      age: userInfo?.age,
      travelStyles: userInfo?.travelStyles || [],
      fullname: userInfo?.fullname || 'ผู้สร้างทริป',
    },
    fullname: formData2.name || 'ชื่อทริป',
  };

  return trip;
}
