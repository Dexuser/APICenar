import User from "../models/User.js";
import UserRoles from "../models/enums/userRoles.js";
import bcrypt from "bcrypt";

const seedDefaultAdmin = async () => {
    const email = "admin@miapp.com";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
        return;
    }

    const hashedPassword = await bcrypt.hash("Password$1!", 10);

    await User.create({
        firstName: "System",
        lastName: "Admin",
        username: "admin",
        phone: "8090000000",
        email,
        password: hashedPassword,
        role: UserRoles.ADMIN,
        isActive: true
    });

    console.log("Default admin inserted");
};

export default seedDefaultAdmin;