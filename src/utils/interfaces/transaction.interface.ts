// transaction.interface.ts
import { Document } from 'mongoose';

export interface Transaction {
  transactionID: string;
  userID: string;
  transactionType: 'buy' | 'sell';
  symbol: string;
  price: number;
  quantity: number;
  timestamp: Date;
  status: string;
}