// order.model.ts
import { Document, Schema, model } from 'mongoose';
import { Order } from '../utils/interfaces/order.interface';

export interface OrderModel extends Order, Document {}

const OrderSchema = new Schema({
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

export default model<OrderModel>('Order', OrderSchema);