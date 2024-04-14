import { model } from "mongoose";
import { Schema } from "mongoose";
import { PurchasedStockModel } from "../utils/interfaces/purchasedStock.interface";

// Schema for PurchasedStock
const PurchasedStockSchema = new Schema({
  userID:{
    type:Schema.Types.ObjectId,
    ref:'Users'
},
    stockId: { type: Schema.Types.ObjectId, ref: 'Stock' }, // Assuming 'Stock' is the name of your stock model
    symbol: { type: String, required: true },
    shares: { type: Number, required: true },
    initialInvestment: { type: Number, required: true },
  });
  
  export default model<PurchasedStockModel>('PurchasedStock', PurchasedStockSchema);