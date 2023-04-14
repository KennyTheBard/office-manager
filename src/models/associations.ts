import { Booking, Employee, Room } from ".";

/**
 * Establish associations between models before they are synced.
 */
export const EmployeeToBooking = Employee.hasMany(Booking);
export const BookingToEmployee = Booking.belongsTo(Employee);
export const RoomToBooking = Room.hasMany(Booking);
export const BookingToRoom = Booking.belongsTo(Room);