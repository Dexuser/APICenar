import Favorite from "../../models/Favorite.js";
import User from "../../models/User.js";
import UserRoles from "../../models/enums/userRoles.js";
import { sendError, sendSuccess } from "../../utils/apiResponses.js";
import {
  buildPaginatedResult,
  escapeRegex,
  getListQueryOptions,
} from "../../utils/apiQuery.js";

export async function getMyFavorites(req, res) {
  const { page, pageSize, skip, sort, search } = getListQueryOptions(req.query, {
    defaultSortBy: "createdAt",
    defaultSortDirection: "desc",
    allowedSortFields: ["createdAt", "updatedAt"],
  });

  const favoriteDocuments = await Favorite.find({ userId: req.user._id })
    .sort(sort)
    .lean();

  const favoriteCommerceIds = favoriteDocuments.map((favorite) => favorite.commerceId);

  let commerceFilters = {
    _id: { $in: favoriteCommerceIds },
    role: UserRoles.COMMERCE,
    isActive: true,
  };

  if (search) {
    commerceFilters.commerceName = new RegExp(escapeRegex(search), "i");
  }

  const commerces = await User.find(commerceFilters).lean();
  const commerceMap = new Map(
    commerces.map((commerce) => [commerce._id.toString(), commerce])
  );

  const filteredItems = favoriteDocuments
    .map((favorite) => {
      const commerce = commerceMap.get(favorite.commerceId.toString());

      if (!commerce) {
        return null;
      }

      return {
        id: favorite._id.toString(),
        commerceId: commerce._id.toString(),
        name: commerce.commerceName,
        description: commerce.description || null,
        logo: commerce.commerceLogo || null,
        openingTime: commerce.openTime,
        closingTime: commerce.closeTime,
        createdAt: favorite.createdAt,
      };
    })
    .filter(Boolean);

  const items = filteredItems.slice(skip, skip + pageSize);
  const total = filteredItems.length;

  return sendSuccess(
    res,
    200,
    buildPaginatedResult(items, total, page, pageSize)
  );
}

export async function addFavorite(req, res) {
  const commerce = await User.findOne({
    _id: req.body.commerceId,
    role: UserRoles.COMMERCE,
    isActive: true,
  });

  if (!commerce) {
    return sendError(res, 404, "Commerce not found.");
  }

  const existingFavorite = await Favorite.findOne({
    userId: req.user._id,
    commerceId: req.body.commerceId,
  });

  if (existingFavorite) {
    return sendError(res, 409, "Commerce is already in favorites.");
  }

  const favorite = await Favorite.create({
    userId: req.user._id,
    commerceId: commerce._id,
  });

  return sendSuccess(res, 201, {
    id: favorite._id.toString(),
    commerceId: commerce._id.toString(),
    message: "Favorite created successfully.",
  });
}

export async function removeFavorite(req, res) {
  const result = await Favorite.deleteOne({
    userId: req.user._id,
    commerceId: req.params.commerceId,
  });

  if (!result.deletedCount) {
    return sendError(res, 404, "Favorite not found.");
  }

  return res.status(204).send();
}
