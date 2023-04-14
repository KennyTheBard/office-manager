/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    ObjectType,
    Field,
    ID,
    Arg,
    Mutation,
    Query,
    Resolver,
    Ctx,
} from 'type-graphql';
import {Room} from '../models';
import {AppContext, EmployeeOutput} from '.';

@ObjectType()
export class RoomOutput {
    @Field(() => ID)
    id!: number;

    @Field()
    name!: string;

    @Field()
    openingHours!: number;

    @Field()
    closingHours!: number;
}

@ObjectType()
export class RoomSlotFreeOutput {
    @Field()
    type!: 'free';

    @Field()
    startTime!: Date;

    @Field()
    endTime!: Date;
}

@ObjectType()
export class RoomSlotClosedOutput {
    @Field()
    type!: 'closed';

    @Field()
    startTime!: Date;

    @Field()
    endTime!: Date;
}

@ObjectType()
export class RoomSlotBookedOutput {
    @Field()
    type!: 'booked';

    @Field(() => EmployeeOutput)
    employee!: EmployeeOutput;

    @Field()
    startTime!: Date;

    @Field()
    endTime!: Date;
}

@ObjectType()
export class RoomScheduleOutput {
    @Field(() => [
        RoomSlotFreeOutput,
        RoomSlotClosedOutput,
        RoomSlotBookedOutput,
    ])
    slots!: (
        | RoomSlotFreeOutput
        | RoomSlotClosedOutput
        | RoomSlotBookedOutput
    )[];
}

@Resolver(Room)
export class RoomResolver {
    @Query(() => RoomOutput)
    async room(@Arg('id') id: number): Promise<RoomOutput | null> {
        const room = await Room.findByPk(id);
        if (!room) {
            throw new Error(`Room with id ${id} not found`);
        }
        return room;
    }

    @Query(() => [RoomOutput])
    async rooms(): Promise<RoomOutput[]> {
        return await Room.findAll();
    }

    @Mutation(() => RoomOutput)
    async createRoom(
        @Arg('name') name: string,
        @Arg('openingHours') openingHours: number,
        @Arg('closingHours') closingHours: number
    ): Promise<RoomOutput> {
        const room = await Room.create({
            name,
            openingHours,
            closingHours,
        });
        await room.save();
        return room;
    }

    @Query(() => RoomScheduleOutput)
    async roomSchedule(
        @Arg('roomId') roomId: number,
        @Arg('startTime') startTime: Date,
        @Arg('endTime') endTime: Date,
        @Ctx() {roomService}: AppContext
    ): Promise<RoomScheduleOutput> {
        return await roomService.getRoomSchedule(roomId, startTime, endTime);
    }

    @Query(() => [RoomOutput])
    async availableRooms(
        @Arg('startTime') startTime: Date,
        @Arg('endTime') endTime: Date,
        @Ctx() {roomService}: AppContext
    ): Promise<RoomOutput[]> {
        return await roomService.getAvailableRooms(startTime, endTime);
    }
}
