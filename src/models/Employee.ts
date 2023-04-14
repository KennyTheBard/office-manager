import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    HasManyGetAssociationsMixin,
    Association,
    DataTypes,
    HasManySetAssociationsMixin,
    NonAttribute,
    HasManyAddAssociationsMixin,
} from 'sequelize';
import {Booking, sequelize} from '.';

export class Employee extends Model<
    InferAttributes<Employee>,
    InferCreationAttributes<Employee>
> {
    declare id: CreationOptional<number>;
    declare email: string;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare bookings?: NonAttribute<Booking[]>;

    declare getBookings: HasManyGetAssociationsMixin<Booking>;
    declare setBookings: HasManySetAssociationsMixin<Booking, number>;

    declare static associations: {
        bookings: Association<Employee, Booking>;
    };
}

export type EmployeeDto = {
    id: number;
    email: string;
};

export const EmployeeModel = Employee.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
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
        tableName: 'employees',
        underscored: true,
        sequelize,
    }
);
