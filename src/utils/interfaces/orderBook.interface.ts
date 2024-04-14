// orderBook.interface.ts
export interface OrderBook {
  userID: string;
  symbol: string;
  orderType: 'limit' | 'market';
  transactionType: 'buy' | 'sell';
  price: number;
  quantity: number;
  status: string;
  }