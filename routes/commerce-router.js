import express from "express";
import isAuth from "../middlewares/isAuth.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import UserRoles from "../models/enums/userRoles.js";

import { getHome } from "../controllers/commerce/homeController.js"

// Como todas estas rutas deben de estar protegidas de los otros roles que no son commerce,
// se pone el middleware en el enrutador usando el metodo use
const commerceRouter = express.Router();
commerceRouter.use(isAuth);
commerceRouter.use(roleMiddleware(UserRoles.COMMERCE));

commerceRouter.get("/", getHome)

export default commerceRouter;