import User from "../models/User.js";
import CommerceType from "../models/CommerceType.js";
import UserRoles from "../models/enums/userRoles.js";
import bcrypt from "bcrypt";

const seedDefaultCommerce = async () => {
    const email = "commerce@miapp.com";

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return;
    }

    const restaurantType = await CommerceType.findOne({
        title: "Restaurantes"
    });

    if (!restaurantType) {
        throw new Error("Commerce type 'Restaurantes' not found");
    }

    const hashedPassword = await bcrypt.hash("Password$1!", 10);

    await User.create({
        firstName: "Default",
        lastName: "Commerce",
        username: "commerce",
        phone: "8091111111",
        profilePicture: null,
        email,
        password: hashedPassword,
        role: UserRoles.COMMERCE,
        isActive: true,

        commerceLogo: null,
        commerceName: "La Rigareta",
        openTime: "08:00",
        closeTime: "21:00",
        commerceTypeId: restaurantType._id
    });

    console.log("Default commerce inserted");
};

export default seedDefaultCommerce;