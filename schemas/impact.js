import mongoose from "mongoose";

const impactSchema = new mongoose.Schema({
  id: String,
  shop: String,
  orders: Number,
  donations: Number,
  carbon: Number,
  land: Number
});

const Impact = mongoose.model('Impact', impactSchema);

export default Impact;