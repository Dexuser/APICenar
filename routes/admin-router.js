import express from "express";
import isAuth from "../middlewares/isAuth.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import UserRoles from "../models/enums/userRoles.js";

import { getHome } from "../controllers/admin/homeController.js"

// Como todas estas rutas deben de estar protegidas de los otros roles que no son Admin,
// se pone el middleware en el enrutador usando el metodo use
const adminRouter = express.Router();
adminRouter.use(isAuth);
adminRouter.use(roleMiddleware(UserRoles.ADMIN));

adminRouter.get("/", getHome)


export default adminRouter;