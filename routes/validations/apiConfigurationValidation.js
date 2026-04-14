import { body, param } from "express-validator";

export const validateConfigurationKeyParam = [
  param("key").trim().notEmpty().withMessage("key is required."),
];

export const validateUpdateConfiguration = [
  ...validateConfigurationKeyParam,
  body("key").trim().notEmpty().withMessage("key is required."),
  body("value").trim().notEmpty().withMessage("value is required."),
];
