// order.interface.ts
export interface Order {
    userID: string;
    symbol: string;
    orderType: 'limit' | 'market';
    transactionType: 'buy' | 'sell';
    price?: number; // Price will be optional for market orders
    quantity: number;
    status: string;
  }