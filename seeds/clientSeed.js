import User from "../models/User.js";
import UserRoles from "../models/enums/userRoles.js";
import bcrypt from "bcrypt";

const seedDefaultClient = async () => {
    const email = "client@miapp.com";

    const existingClient = await User.findOne({ email });

    if (existingClient) {
        return;
    }

    const hashedPassword = await bcrypt.hash("Password$1!", 10);

    await User.create({
        firstName: "Default",
        lastName: "Client",
        username: "client",
        phone: "8092222223",
        email,
        password: hashedPassword,
        role: UserRoles.CLIENT,
        isActive: true
    });

    console.log("Default client inserted");
};

export default seedDefaultClient;