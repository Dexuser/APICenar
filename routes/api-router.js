import express from "express";
import authRouter from "./api-auth-router.js";
import accountRouter from "./api-account-router.js";
import addressesRouter from "./api-addresses-router.js";
import clientCatalogRouter from "./api-client-catalog-router.js";
import favoritesRouter from "./api-favorites-router.js";
import categoriesRouter from "./api-categories-router.js";
import productsRouter from "./api-products-router.js";
import ordersRouter from "./api-orders-router.js";
import configurationsRouter from "./api-configurations-router.js";
import adminCommerceTypesRouter from "./api-admin-commerce-types-router.js";
import adminDashboardRouter from "./api-admin-dashboard-router.js";
import adminUsersRouter from "./api-admin-users-router.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/account", accountRouter);
router.use("/addresses", addressesRouter);
router.use("/favorites", favoritesRouter);
router.use("/categories", categoriesRouter);
router.use("/products", productsRouter);
router.use("/orders", ordersRouter);
router.use("/configurations", configurationsRouter);
router.use("/admin", adminDashboardRouter);
router.use("/admin/users", adminUsersRouter);
router.use("/admin/commerce-types", adminCommerceTypesRouter);


router.use("/", clientCatalogRouter); // This should be the last route to avoid conflicts with other routes

export default router;
