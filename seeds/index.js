import "../utils/LoadEnvConfig.js";
import mongoose from "mongoose";
import seedCommerceTypes from "./commerceTypeSeed.js"
import seedDefaultAdmin from "./adminSeed.js";
import seedDefaultCommerce from "./commerceSeed.js";
import seedDefaultClient from "./clientSeed.js";
import seedDefaultDelivery from "./deliverySeed.js";

const runSeeds = async () => {
    try {

        const mongoUri =
            process.env.MONGO_URI ||
            `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

        console.log(mongoUri);
        // Connect to MongoDB
        await mongoose.connect(mongoUri);

        console.log("Mongo connected");

        await seedCommerceTypes();
        await seedDefaultAdmin();
        await seedDefaultCommerce();
        await seedDefaultClient();
        await seedDefaultDelivery();

        console.log("Seeds executed successfully");
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.connection.close();
    }
};

runSeeds(); // haz "npm run seed"