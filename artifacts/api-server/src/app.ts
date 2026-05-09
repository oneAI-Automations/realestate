import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Fix for "Expression is not callable" and "Implicit any"
const httpLogger = (pinoHttp as any).default || pinoHttp;

app.use(
  httpLogger({
    logger,
    serializers: {
      req(req: any) { // Added : any to satisfy Vercel/TypeScript
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: any) { // Added : any to satisfy Vercel/TypeScript
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Your API routes
app.use("/api", router);

// Added a basic health check for Vercel deployment verification
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "Vylore API is Live" });
});

export default app;
