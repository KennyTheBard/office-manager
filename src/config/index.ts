import * as dotenv from 'dotenv';

dotenv.config();

export const config: Config = {
    port: parseInt(process.env.PORT ?? '3000'),
    pg: {
        host: process.env.PG_HOST!,
        port: parseInt(process.env.PG_PORT!),
        database: process.env.PG_DATABASE!,
        username: process.env.PG_USER!,
        password: process.env.PG_PASSWORD!,
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
