import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    NonAttribute,
    HasManyGetAssociationsMixin,
    Association,
    HasManySetAssociationsMixin,
    DataTypes,
} from 'sequelize';
import {Booking, sequelize} from '.';

export class Room extends Model<
    InferAttributes<Room>,
    InferCreationAttributes<Room>
> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare openingHours: number;
    declare closingHours: number;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare bookings?: NonAttribute<Booking[]>;

    declare getBookings: HasManyGetAssociationsMixin<Booking>;
    declare setBookings: HasManySetAssociationsMixin<Booking, number>;

    declare static associations: {
        bookings: Association<Room, Booking>;
    };
}

export const RoomModel = Room.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        openingHours: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        closingHours: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
        tableName: 'rooms',
        underscored: true,
        sequelize,
    }
);
