import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Use ObjectId for MongoDB references
      ref: "User",
      required: true
    },
    commerceId: { // Aqui va un user de tipo Commerce
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    collection: 'Favorite' // Specify the collection name, is equivalent to table name in SQL
  }
);

// Evita que un repita como favorito un mismo comercio
favoriteSchema.index(
  { userId: 1, commerceId: 1 },
  { unique: true }
);

const Favorite = mongoose.model("Favorite", favoriteSchema); // Create the model from the schema

export default Favorite;
