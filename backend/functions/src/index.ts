import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const helloZenSweep = onRequest((request, response) => {
    logger.info("Zen Sweep backend is working!", {
        structuredData: true,
    });

    response.status(200).send("Zen Sweep Firebase Backend is Working!");
});