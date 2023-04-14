import { BookingService, RoomService } from '../services';

export * from './EmployeeResolver';
export * from './RoomResolver';
export * from './BookingResolver';

export type AppContext = {
    bookingService: BookingService;
    roomService: RoomService;
}