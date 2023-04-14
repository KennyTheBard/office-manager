/* eslint-disable @typescript-eslint/no-explicit-any */
import {Room} from '../../src/models';
import {RoomService, BookingService} from '../../src/services';

describe('RoomService', () => {
    let roomService: RoomService;
    let bookingService: BookingService;

    beforeEach(() => {
        bookingService = {
            getBookingsInInterval: jest.fn(),
        } as any;

        roomService = new RoomService(bookingService);
    });

    describe('getAvailableRooms', () => {
        test('check for open hours', async () => {
            Room.findAll = jest
                .fn()
                .mockResolvedValue([
                    {id: 2, openingHours: 480, closingHours: 1200},
                ] as any);

            (
                bookingService.getBookingsInInterval as jest.MockedFunction<
                    typeof bookingService.getBookingsInInterval
                >
            ).mockResolvedValue([] as any);

            const startTime = new Date('2023-04-15T14:00:00.000Z');
            const endTime = new Date('2023-04-15T15:00:00.000Z');
            const result = await roomService.getAvailableRooms(
                startTime,
                endTime
            );

            expect(bookingService.getBookingsInInterval).toHaveBeenCalledWith(
                startTime,
                endTime
            );
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(1);
            expect(result[0]).toBeDefined();
            expect(result[0].id).toEqual(2);

            (
                Room.findAll as jest.MockedFunction<typeof Room.findAll>
            ).mockRestore();
        });

        test('check for existing bookings', async () => {
            Room.findAll = jest.fn().mockResolvedValue([
                {
                    id: 1,
                    openingHours: 540, // 9:00 AM in minutes from midnight
                    closingHours: 1080, // 6:00 PM in minutes from midnight
                },
                {
                    id: 2,
                    openingHours: 540, // 9:00 AM in minutes from midnight
                    closingHours: 1080, // 6:00 PM in minutes from midnight
                },
            ] as any);

            (
                bookingService.getBookingsInInterval as jest.MockedFunction<
                    typeof bookingService.getBookingsInInterval
                >
            ).mockResolvedValue([
                {
                    startTime: new Date('2023-04-15T14:00:00.000Z'),
                    endTime: new Date('2023-04-15T14:30:00.000Z'),
                    room: {id: 2},
                },
            ] as any);

            const startTime = new Date('2023-04-15T14:00:00.000Z');
            const endTime = new Date('2023-04-15T15:00:00.000Z');
            const result = await roomService.getAvailableRooms(
                startTime,
                endTime
            );

            expect(bookingService.getBookingsInInterval).toHaveBeenCalledWith(
                startTime,
                endTime
            );
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(1);
            expect(result[0]).toBeDefined();
            expect(result[0].id).toEqual(1);

            (
                Room.findAll as jest.MockedFunction<typeof Room.findAll>
            ).mockRestore();
        });
    });

    describe('getRoomSchedule', () => {
        test('check single free interval', async () => {
            Room.findByPk = jest.fn().mockResolvedValue({
                id: 1,
                openingHours: 540, // 9:00 AM in minutes from midnight
                closingHours: 1080, // 6:00 PM in minutes from midnight
            });

            bookingService.getSortedBookingsInInterval = jest
                .fn()
                .mockResolvedValue([]);

            const startTime = new Date('2023-04-15T09:00:00.000Z');
            const endTime = new Date('2023-04-15T10:00:00.000Z');
            const schedule = await roomService.getRoomSchedule(
                1,
                startTime,
                endTime
            );

            expect(schedule.slots).toHaveLength(1);
            expect(schedule.slots).toEqual([
                {
                    type: 'free',
                    startTime,
                    endTime,
                },
            ]);

            (
                Room.findByPk as jest.MockedFunction<typeof Room.findByPk>
            ).mockRestore();
        });

        test('check single free interval overlapping with closed hours', async () => {
            Room.findByPk = jest.fn().mockResolvedValue({
                id: 1,
                openingHours: 540, // 9am in minutes from midnight
                closingHours: 1020, // 5pm in minutes from midnight
            });

            bookingService.getSortedBookingsInInterval = jest
                .fn()
                .mockResolvedValue([]);

            const startTime = new Date('2023-04-15T08:00:00.000Z');
            const endTime = new Date('2023-04-15T18:00:00.000Z');
            const schedule = await roomService.getRoomSchedule(
                1,
                startTime,
                endTime
            );

            expect(schedule.slots).toHaveLength(3);
            expect(schedule.slots[0]).toEqual({
                type: 'closed',
                startTime: startTime,
                endTime: new Date('2023-04-15T09:00:00.000Z'),
            });
            expect(schedule.slots[1]).toEqual({
                type: 'free',
                startTime: new Date('2023-04-15T09:00:00.000Z'),
                endTime: new Date('2023-04-15T17:00:00.000Z'),
            });
            expect(schedule.slots[2]).toEqual({
                type: 'closed',
                startTime: new Date('2023-04-15T17:00:00.000Z'),
                endTime: endTime,
            });

            (
                Room.findByPk as jest.MockedFunction<typeof Room.findByPk>
            ).mockRestore();
        });

        test('check existing booking in the middle of the open hours', async () => {
            Room.findByPk = jest.fn().mockResolvedValue({
                id: 1,
                openingHours: 540, // 9:00 AM in minutes from midnight
                closingHours: 1080, // 6:00 PM in minutes from midnight
            });
            const employee = {
                id: 1,
                email: 'test@example.com',
            };
            bookingService.getSortedBookingsInInterval = jest
                .fn()
                .mockResolvedValue([
                    {
                        id: 1,
                        employee,
                        roomId: 1,
                        startTime: new Date('2023-04-15T10:00:00.000Z'),
                        endTime: new Date('2023-04-15T11:30:00.000Z'),
                    },
                ]);

            const startTime = new Date('2023-04-15T09:30:00.000Z');
            const endTime = new Date('2023-04-15T12:00:00.000Z');
            const schedule = await roomService.getRoomSchedule(
                1,
                startTime,
                endTime
            );

            expect(schedule.slots).toHaveLength(3);
            expect(schedule.slots[0]).toEqual({
                type: 'free',
                startTime: startTime,
                endTime: new Date('2023-04-15T10:00:00.000Z'),
            });
            expect(schedule.slots[1]).toEqual({
                type: 'booked',
                employee,
                startTime: new Date('2023-04-15T10:00:00.000Z'),
                endTime: new Date('2023-04-15T11:30:00.000Z'),
            });
            expect(schedule.slots[2]).toEqual({
                type: 'free',
                startTime: new Date('2023-04-15T11:30:00.000Z'),
                endTime: endTime,
            });

            (
                Room.findByPk as jest.MockedFunction<typeof Room.findByPk>
            ).mockRestore();
        });

        test('check existing booking overlapping with opening hours', async () => {
            Room.findByPk = jest.fn().mockResolvedValue({
                id: 1,
                openingHours: 540, // 9:00 AM in minutes from midnight
                closingHours: 1080, // 6:00 PM in minutes from midnight
            });
            const employee = {
                id: 1,
                email: 'test@example.com',
            };
            bookingService.getSortedBookingsInInterval = jest
                .fn()
                .mockResolvedValue([
                    {
                        id: 1,
                        employee,
                        roomId: 1,
                        startTime: new Date('2023-04-15T09:00:00.000Z'),
                        endTime: new Date('2023-04-15T11:30:00.000Z'),
                    },
                ]);

            const startTime = new Date('2023-04-15T08:00:00.000Z');
            const endTime = new Date('2023-04-15T12:00:00.000Z');
            const schedule = await roomService.getRoomSchedule(
                1,
                startTime,
                endTime
            );

            expect(schedule.slots).toHaveLength(3);
            expect(schedule.slots[0]).toEqual({
                type: 'closed',
                startTime: startTime,
                endTime: new Date('2023-04-15T09:00:00.000Z'),
            });
            expect(schedule.slots[1]).toEqual({
                type: 'booked',
                employee,
                startTime: new Date('2023-04-15T09:00:00.000Z'),
                endTime: new Date('2023-04-15T11:30:00.000Z'),
            });
            expect(schedule.slots[2]).toEqual({
                type: 'free',
                startTime: new Date('2023-04-15T11:30:00.000Z'),
                endTime: endTime,
            });

            (
                Room.findByPk as jest.MockedFunction<typeof Room.findByPk>
            ).mockRestore();
        });
    });
});
