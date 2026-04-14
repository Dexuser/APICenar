import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import User from "../../models/User.js";
import UserRoles from "../../models/enums/userRoles.js";
import { sendSuccess } from "../../utils/apiResponses.js";

export async function getDashboardMetrics(req, res) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    todayOrders,
    activeCommerces,
    inactiveCommerces,
    activeClients,
    inactiveClients,
    activeDeliveries,
    inactiveDeliveries,
    totalProducts,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: todayStart } }),
    User.countDocuments({ role: UserRoles.COMMERCE, isActive: true }),
    User.countDocuments({ role: UserRoles.COMMERCE, isActive: false }),
    User.countDocuments({ role: UserRoles.CLIENT, isActive: true }),
    User.countDocuments({ role: UserRoles.CLIENT, isActive: false }),
    User.countDocuments({ role: UserRoles.DELIVERY, isActive: true }),
    User.countDocuments({ role: UserRoles.DELIVERY, isActive: false }),
    Product.countDocuments(),
  ]);

  return sendSuccess(res, 200, {
    orders: {
      total: totalOrders,
      today: todayOrders,
    },
    commerces: {
      active: activeCommerces,
      inactive: inactiveCommerces,
    },
    clients: {
      active: activeClients,
      inactive: inactiveClients,
    },
    deliveries: {
      active: activeDeliveries,
      inactive: inactiveDeliveries,
    },
    products: {
      total: totalProducts,
    },
  });
}
