import express from "express";
import isAuth from "../middlewares/isAuth.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import UserRoles from "../models/enums/userRoles.js";

import { getHome } from "../controllers/client/homeController.js"

// Como todas estas rutas deben de estar protegidas de los otros roles que no son client,
// se pone el middleware en el enrutador usando el metodo use
const clientRouter = express.Router();
clientRouter.use(isAuth);
clientRouter.use(roleMiddleware(UserRoles.CLIENT));

clientRouter.get("/", getHome)

export default clientRouter;