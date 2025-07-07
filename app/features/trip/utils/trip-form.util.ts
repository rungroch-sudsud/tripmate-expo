import { MAX_TRIP_NAME_WORDS } from '../constants/trip-form.constant';
import { FormData2Fields } from '../schemas/trip.schema';

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
