import express from "express";
import {
  assignDeliveryAutomatically,
  completeOrder,
  createOrder,
  getCommerceOrderDetail,
  getCommerceOrders,
  getDeliveryOrderDetail,
  getDeliveryOrders,
  getMyOrderDetail,
  getMyOrders,
} from "../controllers/api/OrderApiController.js";
import { requireApiAuth, requireApiRole } from "../middlewares/apiAuth.js";
import { handleApiValidation } from "../middlewares/handleApiValidation.js";
import UserRoles from "../models/enums/userRoles.js";
import {
  validateCreateOrder,
  validateOrderId,
  validateOrderStatusQuery,
} from "./validations/apiOrderValidation.js";

const router = express.Router();

router.use(requireApiAuth);

router.post(
  "/",
  requireApiRole(UserRoles.CLIENT),
  validateCreateOrder,
  handleApiValidation,
  createOrder
);

router.get(
  "/my-orders",
  requireApiRole(UserRoles.CLIENT),
  validateOrderStatusQuery,
  handleApiValidation,
  getMyOrders
);

router.get(
  "/my-orders/:id",
  requireApiRole(UserRoles.CLIENT),
  validateOrderId,
  handleApiValidation,
  getMyOrderDetail
);

router.get(
  "/commerce",
  requireApiRole(UserRoles.COMMERCE),
  validateOrderStatusQuery,
  handleApiValidation,
  getCommerceOrders
);

router.get(
  "/commerce/:id",
  requireApiRole(UserRoles.COMMERCE),
  validateOrderId,
  handleApiValidation,
  getCommerceOrderDetail
);

router.patch(
  "/:id/assign-delivery",
  requireApiRole(UserRoles.COMMERCE),
  validateOrderId,
  handleApiValidation,
  assignDeliveryAutomatically
);

router.get(
  "/delivery",
  requireApiRole(UserRoles.DELIVERY),
  validateOrderStatusQuery,
  handleApiValidation,
  getDeliveryOrders
);

router.get(
  "/delivery/:id",
  requireApiRole(UserRoles.DELIVERY),
  validateOrderId,
  handleApiValidation,
  getDeliveryOrderDetail
);

router.patch(
  "/:id/complete",
  requireApiRole(UserRoles.DELIVERY),
  validateOrderId,
  handleApiValidation,
  completeOrder
);

export default router;
