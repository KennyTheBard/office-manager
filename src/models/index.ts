import {Sequelize} from 'sequelize';
import { config } from '../config';

export const sequelize = new Sequelize({
    dialect: 'postgres',
    ...config.pg,
});

export * from './Employee';
export * from './Room';
export * from './Booking';
export * from './sync';
