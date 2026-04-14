import Category from "../../models/Category.js";
import Product from "../../models/Product.js";
import { sendError, sendSuccess } from "../../utils/apiResponses.js";
import {
  buildPaginatedResult,
  escapeRegex,
  getListQueryOptions,
} from "../../utils/apiQuery.js";

async function buildCategoryPayload(category) {
  const productCount = await Product.countDocuments({
    categoryId: category._id,
    commerceId: category.commerceId,
  });

  return {
    id: category._id.toString(),
    name: category.name,
    description: category.description,
    commerceId: category.commerceId.toString(),
    productCount,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export async function getMyCategories(req, res) {
  const { page, pageSize, skip, sort, search } = getListQueryOptions(req.query, {
    defaultSortBy: "createdAt",
    defaultSortDirection: "desc",
    allowedSortFields: ["createdAt", "updatedAt", "name"],
  });

  const filters = {
    commerceId: req.user._id,
  };

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filters.$or = [{ name: regex }, { description: regex }];
  }

  const [categories, total] = await Promise.all([
    Category.find(filters).sort(sort).skip(skip).limit(pageSize).lean(),
    Category.countDocuments(filters),
  ]);

  const items = await Promise.all(
    categories.map((category) => buildCategoryPayload(category))
  );

  return sendSuccess(
    res,
    200,
    buildPaginatedResult(items, total, page, pageSize)
  );
}

export async function getCategoryById(req, res) {
  const category = await Category.findOne({
    _id: req.params.id,
    commerceId: req.user._id,
  }).lean();

  if (!category) {
    return sendError(res, 404, "Category not found.");
  }

  return sendSuccess(res, 200, await buildCategoryPayload(category));
}

export async function createCategory(req, res) {
  const category = await Category.create({
    name: req.body.name,
    description: req.body.description,
    commerceId: req.user._id,
  });

  return sendSuccess(res, 201, await buildCategoryPayload(category));
}

export async function updateCategory(req, res) {
  const category = await Category.findOne({
    _id: req.params.id,
    commerceId: req.user._id,
  });

  if (!category) {
    return sendError(res, 404, "Category not found.");
  }

  category.name = req.body.name;
  category.description = req.body.description;
  await category.save();

  return sendSuccess(res, 200, await buildCategoryPayload(category));
}

export async function deleteCategory(req, res) {
  const category = await Category.findOne({
    _id: req.params.id,
    commerceId: req.user._id,
  });

  if (!category) {
    return sendError(res, 404, "Category not found.");
  }

  const productCount = await Product.countDocuments({
    categoryId: category._id,
    commerceId: req.user._id,
  });

  if (productCount > 0) {
    return sendError(
      res,
      400,
      "Cannot delete a category that still has associated products."
    );
  }

  await Category.deleteOne({ _id: category._id });

  return res.status(204).send();
}
