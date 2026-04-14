import { body, param, query } from "express-validator";

const allowedStatuses = [
  "Pending",
  "InProgress",
  "Completed",
  "pending",
  "inprogress",
  "in_progress",
  "completed",
  "complete",
];

export const validateOrderId = [
  param("id").trim().isMongoId().withMessage("id must be a valid MongoDB id."),
];

export const validateCreateOrder = [
  body("addressId")
    .trim()
    .isMongoId()
    .withMessage("addressId must be a valid MongoDB id."),
  body("items")
    .isArray({ min: 1 })
    .withMessage("items must be a non-empty array."),
  body("items.*.productId")
    .trim()
    .isMongoId()
    .withMessage("items.productId must be a valid MongoDB id."),
  body("items.*.quantity")
    .isInt({ gt: 0 })
    .withMessage("items.quantity must be greater than 0."),
];

export const validateOrderStatusQuery = [
  query("status")
    .optional({ values: "falsy" })
    .custom((value) => {
      if (!allowedStatuses.includes(String(value))) {
        throw new Error("status is invalid.");
      }

      return true;
    }),
];
