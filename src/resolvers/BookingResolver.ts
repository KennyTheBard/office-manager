/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Arg,
    Ctx,
    Field,
    ID,
    Mutation,
    ObjectType,
    Resolver,
} from 'type-graphql';
import {Booking} from '../models';
import {AppContext, EmployeeOutput, RoomOutput} from '.';

@ObjectType()
export class BookingOutput {
    @Field(() => ID)
    id!: number;

    @Field()
    startTime!: Date;

    @Field()
    endTime!: Date;

    @Field(() => EmployeeOutput, {nullable: true})
    employee!: EmployeeOutput;

    @Field(() => RoomOutput)
    room!: RoomOutput;

    @Field()
    cancelled!: boolean;
}

@Resolver()
export class BookingResolver {
    @Mutation(() => BookingOutput)
    async createBooking(
        @Arg('startTime') startTime: Date,
        @Arg('endTime') endTime: Date,
        @Arg('employeeId') employeeId: number,
        @Arg('roomId') roomId: number,
        @Ctx() {bookingService}: AppContext
    ): Promise<BookingOutput | null> {
        // could return error
        return (
            (await bookingService.createBooking(
                employeeId,
                roomId,
                startTime,
                endTime
            )) ?? null
        );
    }

    @Mutation(() => BookingOutput)
    async cancelBooking(@Arg('id') id: number): Promise<BookingOutput> {
        const booking = await Booking.findByPk(id);
        if (!booking) {
            throw new Error(`Booking with id ${id} not found`);
        }

        booking.cancelled = true;
        await booking.save();

        return booking;
    }
}
