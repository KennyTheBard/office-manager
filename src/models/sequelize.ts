import {Sequelize} from 'sequelize';
import {config} from '../config';

console.log(config.pg);

export const sequelize = new Sequelize({
    dialect: 'postgres',
    ...config.pg,
});
