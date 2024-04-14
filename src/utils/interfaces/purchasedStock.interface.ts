import { Document, Schema, model } from 'mongoose';

// Interface for PurchasedStock
export interface PurchasedStockModel extends Document {
  userID: string;
  stockId: string | null; // This should be replaced with the actual stock ID type
  symbol: string;
  shares: number;
  initialInvestment: number;
}