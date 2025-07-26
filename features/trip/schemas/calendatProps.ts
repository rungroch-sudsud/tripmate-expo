export type CalendarProps = {
  startDate: Date | null;
  endDate: Date | null;
  onDateSelect: (start: Date, end: Date | null) => void;
};
