import mongoose, { Document, Schema } from 'mongoose';
import { StockModel as StockModelInterface } from '../utils/interfaces/stock.interface';

export interface StockModel extends StockModelInterface, Document {}

const StockSchema: Schema = new Schema({
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  initialPrice : {type: Number, required: true},
  lastPrice: { type: Number, required: true },
});

export default mongoose.model<StockModel>('Stock', StockSchema);
