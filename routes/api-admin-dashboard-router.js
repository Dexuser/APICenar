import express from "express";
import { getDashboardMetrics } from "../controllers/api/AdminDashboardApiController.js";
import { requireApiAuth, requireApiRole } from "../middlewares/apiAuth.js";
import UserRoles from "../models/enums/userRoles.js";

const router = express.Router();

router.use(requireApiAuth, requireApiRole(UserRoles.ADMIN));

router.get("/dashboard", getDashboardMetrics);

export default router;
