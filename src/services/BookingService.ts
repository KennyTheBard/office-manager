import {Op, Transaction} from 'sequelize';
import {Booking, Room, sequelize} from '../models';
import {BookingToRoom} from '../models/associations';
import {RoomService} from '.';

export class BookingService {
    public getSortedBookingsInInterval = async (
        roomId: number,
        intervalStartTime: Date,
        intervalEndTime: Date
    ): Promise<Booking[]> => {
        return await Booking.findAll({
            where: {
                startTime: {
                    [Op.lt]: intervalEndTime,
                },
                endTime: {
                    [Op.gt]: intervalStartTime,
                },
                cancelled: false,
            },
            include: [
                {
                    association: BookingToRoom,
                    where: {
                        id: roomId,
                    },
                },
            ],
            order: ['startTime'],
        });
    };

    public getBookingsInInterval = async (
        intervalStartTime: Date,
        intervalEndTime: Date
    ): Promise<Booking[]> => {
        return await Booking.findAll({
            where: {
                startTime: {
                    [Op.lt]: intervalEndTime,
                },
                endTime: {
                    [Op.gt]: intervalStartTime,
                },
                cancelled: false,
            },
        });
    };

    public createBooking = async (
        employeeId: number,
        roomId: number,
        startTime: Date,
        endTime: Date
    ): Promise<Booking | undefined> => {
        return await sequelize.transaction(async (transaction: Transaction) => {
            try {
                // check if the room is open during the slot
                const room = await Room.findByPk(roomId);
                if (!room) {
                    throw new Error(`Could not find room ${roomId}`);
                }
                if (
                    RoomService.getMinutesFromMidnight(startTime) <
                        room.openingHours ||
                    RoomService.getMinutesFromMidnight(endTime) >
                        room.closingHours
                ) {
                    throw new Error('Slot outside of open hours');
                }

                // check if there are existing bookings for the desired slot
                const bookings = await Booking.findAll({
                    where: {
                        startTime: {
                            [Op.lt]: endTime,
                        },
                        endTime: {
                            [Op.gt]: startTime,
                        },
                        cancelled: false,
                    },
                });
                if (bookings.length > 0) {
                    throw new Error(
                        `There are already some existing bookings in the slot for room ${roomId}`
                    );
                }

                // create booking
                const booking = await Booking.create({
                    startTime,
                    endTime,
                    cancelled: false,
                });
                booking.setEmployee(employeeId);
                booking.setRoom(roomId);
                await booking.save();

                await transaction.commit();
                return booking;
            } catch (error) {
                await transaction.rollback();
                return undefined;
            }
        });
    };
}
