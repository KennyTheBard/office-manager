import {Op} from 'sequelize';
import {BookingService} from '.';
import {Employee, Room} from '../models';

export class RoomService {
    constructor(private readonly bookingService: BookingService) {}

    public getAvailableRooms = async (
        startTime: Date,
        endTime: Date
    ): Promise<Room[]> => {
        // verify assumptions
        if (startTime.getTime() > endTime.getTime()) {
            throw new Error('Time interval incorrectly defined');
        }
        if (!RoomService.isSameDay(startTime, endTime)) {
            throw new Error('Time interval must be defined on a single day');
        }

        // find out which rooms are open during the interval
        const openedRooms = await Room.findAll({
            where: {
                openingHours: {
                    [Op.lte]: RoomService.getMinutesFromMidnight(startTime),
                },
                closingHours: {
                    [Op.gte]: RoomService.getMinutesFromMidnight(endTime),
                },
            },
        });

        // find out which rooms have bookings overlapped with the interval
        const bookings = await this.bookingService.getBookingsInInterval(
            startTime,
            endTime
        );
        const bookedRooms = bookings.map(booking => booking.room.id);

        const availableRooms: Room[] = [];
        for (const room of openedRooms) {
            if (!bookedRooms.includes(room.id)) {
                availableRooms.push(room);
            }
        }

        return availableRooms;
    };

    public getRoomSchedule = async (
        roomId: number,
        startTime: Date,
        endTime: Date
    ): Promise<RoomSchedule> => {
        // verify assumptions
        if (startTime.getTime() > endTime.getTime()) {
            throw new Error('Time interval incorrectly defined');
        }
        if (!RoomService.isSameDay(startTime, endTime)) {
            throw new Error('Time interval must be defined on a single day');
        }

        const slots: RoomSlot[] = [];
        const room = await Room.findByPk(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} not found`);
        }
        const bookings = await this.bookingService.getSortedBookingsInInterval(
            roomId,
            startTime,
            endTime
        );

        // compute closed slots
        if (room.openingHours > RoomService.getMinutesFromMidnight(startTime)) {
            const openingHours = RoomService.getDateFromMinutesFromMidnight(
                startTime,
                room.openingHours
            );
            slots.push({
                type: 'closed',
                startTime,
                endTime: openingHours,
            });
            startTime = openingHours;
        }
        if (room.closingHours < RoomService.getMinutesFromMidnight(endTime)) {
            const closingHours = RoomService.getDateFromMinutesFromMidnight(
                endTime,
                room.closingHours
            );
            slots.push({
                type: 'closed',
                startTime: closingHours,
                endTime,
            });
            endTime = closingHours;
        }

        // compute free and booked slots
        if (bookings.length > 0) {
            // add a free slot and a booked slot for each booking
            let lastStartTime = startTime;
            for (const booking of bookings) {
                slots.push({
                    type: 'free',
                    startTime: lastStartTime,
                    endTime: booking.startTime,
                });
                slots.push({
                    type: 'booked',
                    employee: booking.employee,
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                });
                lastStartTime = booking.endTime;
            }

            // add last free slot
            const lastBooking = bookings[bookings.length - 1];
            if (endTime.getTime() > lastBooking.endTime.getTime()) {
                slots.push({
                    type: 'free',
                    startTime: lastBooking.endTime,
                    endTime,
                });
            }
        } else {
            slots.push({
                type: 'free',
                startTime,
                endTime,
            });
        }

        return {
            slots: slots
                .filter(
                    slot =>
                        slot.endTime.getTime() - slot.startTime.getTime() > 1
                )
                .sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
        };
    };

    public static getMinutesFromMidnight = (date: Date): number => {
        const midnight = new Date(date);
        midnight.setUTCHours(0, 0, 0, 0); // set time to midnight
        return (date.getTime() - midnight.getTime()) / (1000 * 60);
    };

    public static getDateFromMinutesFromMidnight = (
        date: Date,
        minutesFromMidnight: number
    ): Date => {
        const midnight = new Date(date);
        midnight.setUTCHours(0, 0, 0, 0); // set time to midnight
        return new Date(midnight.getTime() + minutesFromMidnight * 60 * 1000);
    };

    public static isSameDay = (date1: Date, date2: Date): boolean => {
        return (
            date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
        );
    };
}

export type RoomSchedule = {
    slots: RoomSlot[];
};

export type RoomSlotFree = {
    type: 'free';
    startTime: Date;
    endTime: Date;
};

export type RoomSlotClosed = {
    type: 'closed';
    startTime: Date;
    endTime: Date;
};

export type RoomSlotBooked = {
    type: 'booked';
    employee: Employee;
    startTime: Date;
    endTime: Date;
};

export type RoomSlot = RoomSlotFree | RoomSlotClosed | RoomSlotBooked;
