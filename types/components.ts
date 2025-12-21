import { Booking } from './api';

// 预订表单属性
export interface BookingFormProps {
  onBookingSuccess?: () => void;
}

// 预订日历属性
export interface BookingCalendarProps {
  bookings: Booking[];
}
