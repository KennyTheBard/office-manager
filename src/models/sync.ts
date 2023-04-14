import { Booking, Employee, Room, sequelize } from ".";

/**
 * Establish associations between models before they are synced.
 */
export const sync = async (): Promise<void> => {
    // associations have to be in the same file, otherwise there are some errors
    Employee.hasMany(Booking);
    Booking.belongsTo(Employee);
    Room.hasMany(Booking);
    Booking.belongsTo(Room);

    // sync all tables
    await sequelize.sync();
    await Employee.sync();
    await Room.sync();
    await Booking.sync();
};
