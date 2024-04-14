import { Document, Schema } from 'mongoose';

export interface StockModel extends Document {
  symbol: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  initialPrice: number;
  lastPrice: number;
}