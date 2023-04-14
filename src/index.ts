import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import express from "express";
import { buildSchema } from "type-graphql";
import { AppContext, BookingResolver, EmployeeResolver, RoomResolver } from "./resolvers";
import { config } from "./config";
import { RoomService, BookingService } from "./services";


(async () => {

    const bookingService = new BookingService();
    const roomService = new RoomService(bookingService);

    const context: AppContext = { bookingService, roomService };

    const app = express();
    app.use(cors());

    const schema = await buildSchema({
        resolvers: [EmployeeResolver, RoomResolver, BookingResolver],
        emitSchemaFile: {
            path: "schema.graphql"
        },
    });

    const server = new ApolloServer({
        schema,
        context
    });
    await server.start();
    server.applyMiddleware({ app, path: "/graphql" });

    app.listen(config.port, () => {
        console.log(`Server started on http://localhost:${config.port}/graphql`);
    });

})();