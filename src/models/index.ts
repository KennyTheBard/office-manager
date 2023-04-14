import { sequelize } from './sequelize';
import { Booking } from './Booking';
import { Employee } from './Employee';
import { Room } from './Room';

import './associations';

export * from './associations';
export { sequelize, Employee, Room, Booking };
