import * as dotenv from 'dotenv';

dotenv.config();

export const config: Config = {
    port: parseInt(process.env.PORT ?? '3000'),
    pg: {
        host: process.env.PGHOST!,
        port: parseInt(process.env.PGPORT!),
        database: process.env.PGDATABASE!,
        username: process.env.PGUSER!,
        password: process.env.PGPASSWORD!,
    },
};

export type Config = {
    port: number;
    pg: {
        host: string;
        port?: number;
        database: string;
        username: string;
        password: string;
    };
};