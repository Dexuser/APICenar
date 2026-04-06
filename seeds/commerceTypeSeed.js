import CommerceType from "../models/CommerceType.js";

const seedCommerceTypes = async () => {
    const commerceTypes = [
        {
            title: "Restaurantes",
            image: "defaultNullImage"
        },
        {
            title: "Farmacias",
            image: "defaultNullImage"
        },
        {
            title: "Supermercados",
            image: "defaultNullImage"
        }
    ];

    for (const commerceType of commerceTypes) {
        const existingCommerceType = await CommerceType.findOne({
            title: commerceType.title
        });

        if (!existingCommerceType) {
            await CommerceType.create(commerceType);
            console.log(`Commerce type '${commerceType.title}' inserted`);
        }
    }
};

export default seedCommerceTypes;