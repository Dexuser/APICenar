import User from "../models/User.js";
import UserRoles from "../models/enums/userRoles.js";
import bcrypt from "bcrypt";

const seedDefaultDelivery = async () => {
    const email = "delivery@miapp.com";

    const existingDelivery = await User.findOne({ email });

    if (existingDelivery) {
        return;
    }

    const hashedPassword = await bcrypt.hash("Password$1!", 10);

    await User.create({
        firstName: "Default",
        lastName: "Delivery",
        username: "Delivery",
        phone: "80922333333",
        email,
        password: hashedPassword,
        role: UserRoles.DELIVERY,
        isActive: true,
        isBusy: false,
    });

    console.log("Default Delivery inserted");
};

export default seedDefaultDelivery;