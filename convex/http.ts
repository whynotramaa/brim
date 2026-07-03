import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// Registers the Better Auth HTTP routes (sign-in, callbacks, session, etc.)
authComponent.registerRoutes(http, createAuth);

export default http;
