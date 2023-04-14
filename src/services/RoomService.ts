import { Op } from "sequelize";
import { BookingService } from ".";
import { Employee, Room, RoomToBooking } from "../models";


export class RoomService {

    constructor(
        private readonly bookingService: BookingService,
    ) { }

    // Assumption: startTime and endTime are in the same date
    // TODO: validate this ^
    public getAvailableRooms = async (startTime: Date, endTime: Date): Promise<Room[]> => {
        const openedRooms = await Room.findAll({
            where: {
                openingHours: {
                    [Op.lte]: this.getMinutesFromMidnight(startTime)
                },
                closingHours: {
                    [Op.gte]: this.getMinutesFromMidnight(endTime)
                },
            }
        });
        const bookings = await this.bookingService.getBookingsInInterval(startTime, endTime);
        const bookedRooms = bookings.map(booking => booking.room.id);

        const availableRooms: Room[] = [];
        for (const room of openedRooms) {
            if (!bookedRooms.includes(room.id)) {
                availableRooms.push(room);
            }
        }

        return availableRooms;
    }

    // assume that startTime and endTime are durning the same day
    // TODO: enforce this ^
    public getRoomSchedule = async (roomId: number, startTime: Date, endTime: Date): Promise<RoomSchedule> => {
        let slots: RoomSlot[] = [];
        const room = await Room.findByPk(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} not found`);
        }
        const bookings = await this.bookingService.getSortedBookingsInInterval(roomId, startTime, endTime);

        // compute closed slots
        if (room.openingHours > this.getMinutesFromMidnight(startTime)) {
            const openingHours = this.getDateFromMinutesFromMidnight(room.openingHours);
            slots.push({
                type: 'closed',
                startTime,
                endTime: openingHours
            });
        }
        if (room.closingHours < this.getMinutesFromMidnight(startTime)) {
            const closingHours = this.getDateFromMinutesFromMidnight(room.closingHours);
            slots.push({
                type: 'closed',
                startTime: closingHours,
                endTime
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
                    endTime: booking.startTime
                })
                slots.push({
                    type: 'booked',
                    employee: booking.employee,
                    startTime: booking.startTime,
                    endTime: booking.endTime
                });
                lastStartTime = booking.endTime;
            }

            // add last free slot
            const lastBooking = bookings[bookings.length - 1];
            if (endTime.getTime() > lastBooking.endTime.getTime()) {
                slots.push({
                    type: 'free',
                    startTime: lastBooking.endTime,
                    endTime
                })
            }
        } else {
            slots.push({
                type: 'free',
                startTime,
                endTime
            })
        }

        return {
            slots: slots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
        };
    }

    private getMinutesFromMidnight = (date: Date): number => {
        const midnight = new Date(date);
        midnight.setHours(0, 0, 0, 0); // set time to midnight
        return (date.getTime() - midnight.getTime()) / (1000 * 60);
    }


    private getDateFromMinutesFromMidnight = (minutesFromMidnight: number): Date => {
        const midnight = new Date();
        midnight.setHours(0, 0, 0, 0); // set time to midnight
        return new Date(midnight.getTime() + minutesFromMidnight * 60 * 1000);
    }

}

export type RoomSchedule = {
    slots: RoomSlot[];
}

export type RoomSlotFree = {
    type: 'free';
    startTime: Date;
    endTime: Date;
}

export type RoomSlotClosed = {
    type: 'closed';
    startTime: Date;
    endTime: Date;
}

export type RoomSlotBooked = {
    type: 'booked';
    employee: Employee;
    startTime: Date;
    endTime: Date;
}

export type RoomSlot = RoomSlotFree | RoomSlotClosed | RoomSlotBooked;