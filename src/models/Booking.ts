import {
    Association,
    CreationOptional,
    DataTypes,
    HasManyGetAssociationsMixin,
    HasOneSetAssociationMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from 'sequelize';
import {Employee, Room, sequelize} from '.';

export class Booking extends Model<
    InferAttributes<Booking>,
    InferCreationAttributes<Booking>
> {
    declare id: CreationOptional<number>;
    declare startTime: Date;
    declare endTime: Date;
    declare cancelled: boolean;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare employee: NonAttribute<Employee>;
    declare room: NonAttribute<Room>;

    declare getEmployee: HasManyGetAssociationsMixin<Employee>;
    declare setEmployee: HasOneSetAssociationMixin<Employee, number>;

    declare getRoom: HasManyGetAssociationsMixin<Room>;
    declare setRoom: HasOneSetAssociationMixin<Room, number>;

    declare static associations: {
        employee: Association<Booking, Employee>;
        room: Association<Booking, Room>;
    };
}

export const BookingModel = Booking.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        startTime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endTime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        cancelled: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: 'bookings',
        underscored: true,
        sequelize,
    }
);
