// orderBook.model.ts
import { Document, Schema, model } from 'mongoose';
import { OrderBook } from '../utils/interfaces/orderBook.interface';

export interface OrderBookModel extends OrderBook, Document {}

const OrderBookSchema = new Schema({
  userID:{
    type:Schema.Types.ObjectId,
    ref:'Users'
},
  symbol: { type: String, required: true },
  orderType: { type: String, enum: ['limit', 'market'], required: true },
  transactionType: { type: String, enum: ['buy', 'sell'], required: true },
  price: { type: Number },
  quantity: { type: Number, required: true },
  status: { type: String, required: true }
});

export default model<OrderBookModel>('OrderBook', OrderBookSchema);