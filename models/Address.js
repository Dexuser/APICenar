import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Use ObjectId for MongoDB references
      ref: "User", // Reference to the Users model
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    collection: 'Adresses' // Specify the collection name, is equivalent to table name in SQL
  }
);

const Address = mongoose.model("Adress", addressSchema); // Create the model from the schema

export default Address;
