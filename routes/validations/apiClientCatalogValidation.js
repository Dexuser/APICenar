import { param, query } from "express-validator";

export const validateCommerceIdParam = [
  param("commerceId")
    .trim()
    .isMongoId()
    .withMessage("commerceId must be a valid MongoDB id."),
];

export const validateCommerceListQuery = [
  query("commerceTypeId")
    .optional({ values: "falsy" })
    .trim()
    .isMongoId()
    .withMessage("commerceTypeId must be a valid MongoDB id."),
];
