import { Schema, model } from 'mongoose';
import { Transaction } from '../utils/interfaces/transaction.interface';

export interface TransactionModel extends Transaction, Document {}

const TransactionSchema = new Schema({
  transactionID: { type: String, required: true },
  userID:{
    type:Schema.Types.ObjectId,
    ref:'Users'
},
  transactionType: { type: String, enum: ['buy', 'sell'], required: true },
  symbol: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  timestamp: { type: Date, required: true },
  status: { type: String, required: true }
});

export default model<TransactionModel>('Transaction', TransactionSchema);