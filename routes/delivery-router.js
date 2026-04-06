import express from "express";
import isAuth from "../middlewares/isAuth.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import UserRoles from "../models/enums/userRoles.js";

import { getHome } from "../controllers/delivery/homeController.js"

// Como todas estas rutas deben de estar protegidas de los otros roles que no son Admin,
// se pone el middleware en el enrutador usando el metodo use
const deliveryRouter = express.Router();
deliveryRouter.use(isAuth);
deliveryRouter.use(roleMiddleware(UserRoles.DELIVERY));

deliveryRouter.get("/", getHome)

export default deliveryRouter;