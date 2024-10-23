import express from "express";
import userRoutes from "./userRoutes.js";
import messageRoutes from "./messageRoutes.js";
import tokenRoutes from "./tokenRoutes.js";

const rootRoutes = express.Router();

rootRoutes.use("/message", messageRoutes);
rootRoutes.use("/user", userRoutes);
rootRoutes.use("/token", tokenRoutes);

export default rootRoutes;
