import {Sequelize} from 'sequelize';
import { config } from '../config';

const sequelize = new Sequelize({
    dialect: 'postgres',
    ...config.pg,
});

import { Booking } from './Booking';
import { Employee } from './Employee';
import { Room } from './Room';

import './associations';

export * from './associations';
export { sequelize, Employee, Room, Booking };