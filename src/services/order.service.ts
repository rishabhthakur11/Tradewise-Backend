import OrderModel, { OrderModel as OrderModelInterface } from '../models/order.model';
import OrderBookModel from '../models/orderBook.model';
import TransactionModel from '../models/transaction.model';
import UserModel from '../models/user.model';
import StockModel from '../models/stock.model';
import PurchasedStockModel from '../models/purchasedStock.model';
import { Transaction } from '../utils/interfaces/transaction.interface';
import { v4 as uuidv4 } from 'uuid';
import StockService from './stock.service';

import UserType from 'src/utils/interfaces/user.interface';
import ProfileServices from './profile.services';

class OrderService {
  private profileServices = new ProfileServices();
  private stockService = new StockService();
  private getLastPrice = async (symbol: string): Promise<number | undefined> => {
    try {
      const stock = await StockModel.findOne({ symbol });
      return stock?.lastPrice !== null ? stock?.lastPrice : undefined;
    } catch (error:any) {
      throw new Error('Failed to get last price from stock data: ' + error.message);
    }
  }

  private updateLastPrice = async (symbol: string, newPrice: number | undefined): Promise<void> => {
    try {
      if (newPrice === undefined || newPrice === null) {
        throw new Error('New price is not available');
      }
  
      const stock = await StockModel.findOne({ symbol });
      if (!stock) {
        throw new Error('Stock not found');
      }
      
      stock.lastPrice = newPrice;
      await stock.save();
    } catch (error:any) {
      throw new Error('Failed to update last price of the stock: ' + error.message);
    }
  }
  
  // private updateUserBalance = async (transaction: Transaction): Promise<void> => {
  //   try {
  //     const user = await UserModel.findById(transaction.userID);
  //     if (!user) {
  //       throw new Error('User not found');
  //     }
  
  //     if (transaction.transactionType === 'buy') {
  //       user.balance -= transaction.price * transaction.quantity;
  //     } else {
  //       user.balance += transaction.price * transaction.quantity;
  //     }
  
  //     await user.save();
  //   } catch (error: any) {
  //     throw new Error('Failed to update user balance: ' + error.message);
  //   }
  // }

  private updatePurchasedStocks = async (transactions: Transaction[]): Promise<void> => {
    try {
      for (const transaction of transactions) {
        const existingStock = await PurchasedStockModel.findOne({
          userID: transaction.userID,
          symbol: transaction.symbol,
        });
  
        if (existingStock) {
          if(transaction.transactionType === 'buy') {
            // We here need to increase the stocks in the portfolio
            existingStock.shares += transaction.quantity;
            existingStock.initialInvestment += (transaction.price * transaction.quantity);
          }
          else if(transaction.transactionType === 'sell'){
            // We here need to decrease the stocks in the portfolio
            existingStock.shares -= transaction.quantity;
            existingStock.initialInvestment -= (transaction.price * transaction.quantity);
          }
          await existingStock.save();
        } else {
          if(transaction.transactionType === 'buy'){
            await PurchasedStockModel.create({
              userID: transaction.userID,
              symbol: transaction.symbol,
              shares: transaction.quantity,
              initialInvestment: (transaction.price * transaction.quantity),
            });
          }
        }
      }
    } catch (error:any) {
      throw new Error('Failed to update purchased stocks: ' + error.message);
    }
  }  
  

  private updateOrderBook = async (order: OrderModelInterface): Promise<void> => {
    try {
      const oppositeTransactionType = order.transactionType === 'buy' ? 'sell' : 'buy';
      const matchingOrder = await OrderBookModel.findOne({
        symbol: order.symbol,
        transactionType: oppositeTransactionType,
      }).sort({ price: oppositeTransactionType === 'sell' ? 1 : -1 }); // Sorting to get the best match based on price
      
      const stock = await StockModel.findOne({
        symbol: order.symbol
      });
      if(!stock) throw new Error("Stock not found!");
      const orderQuantity = order.quantity;
      const stockQuantity = stock.quantity;
      if(stockQuantity < orderQuantity) throw new Error(`${stockQuantity} ${order.symbol} are only available!`)

      
      if(!matchingOrder && stockQuantity>orderQuantity && order.transactionType === 'buy'){
        const buyer = await UserModel.findOne({_id: order.userID});
        if(!buyer) throw new Error("Buyer doesn't exist!");
        const {balance: currentBuyerBalance} = buyer;
        const totalDeductionValue = stock.price * orderQuantity;
        if(totalDeductionValue>currentBuyerBalance) throw new Error("Buyer has insufficient Balance!");
        const transactionID = this.generateTransactionID();
        const buyerTransactionData: Transaction = {
          transactionID,
          userID: order.userID,
          transactionType: order.transactionType,
          symbol: order.symbol,
          price: Number(order.price),
          quantity: order.quantity,
          timestamp: new Date(),
          status: 'completed',
        };
        await this.stockService.decreaseStockQuantity(order.symbol, order.quantity);
        const updatedBuyerBalance = currentBuyerBalance - totalDeductionValue;
        await this.profileServices.updateUserBalance(buyerTransactionData.userID, updatedBuyerBalance);
        await Promise.all([
          TransactionModel.create(buyerTransactionData),
        ]);
        await this.updatePurchasedStocks([buyerTransactionData]);
        await this.updateLastPrice(order.symbol, order.price);  
        order.status = 'completed';
        await OrderModel.create(order);
      }
      else if(matchingOrder && (matchingOrder.transactionType === 'sell' && order.transactionType === 'buy')) {
        // Generate transaction ID
        const transactionID = this.generateTransactionID();
  
        // Create transactions for buyer and seller
        const buyer = await UserModel.findOne({_id: order.userID});
        if(!buyer) throw new Error("Buyer not found"); 
        const buyerTransactionData: Transaction = {
          transactionID,
          userID: order.userID,
          transactionType: order.transactionType,
          symbol: order.symbol,
          price: matchingOrder.price,
          quantity: Math.min(order.quantity, matchingOrder.quantity),
          timestamp: new Date(),
          status: 'completed',
        };
        const {balance: currentBuyerBalance} = buyer;
        const totalDeductionValue = buyerTransactionData.price * buyerTransactionData.quantity;
        if(totalDeductionValue>currentBuyerBalance) throw new Error("Buyer has insufficient Balance!");

        const seller  = await UserModel.findOne({_id: matchingOrder.userID});
        if(!seller) throw new Error("Seller not found");
        const sellerTransactionData: Transaction = {
          transactionID,
          userID: matchingOrder.userID,
          transactionType: oppositeTransactionType,
          symbol: order.symbol,
          price: matchingOrder.price,
          quantity: buyerTransactionData.quantity,
          timestamp: new Date(),
          status: 'completed',
        };

        const {balance: currentSellerBalance} = seller;
        const updatedBuyerBalance = currentBuyerBalance - totalDeductionValue;
        await this.profileServices.updateUserBalance(buyerTransactionData.userID, updatedBuyerBalance);

        const updatedSellerBalance = currentSellerBalance + totalDeductionValue;
        await this.profileServices.updateUserBalance(sellerTransactionData.userID, updatedSellerBalance);
      
        // Create transactions
        await Promise.all([
          TransactionModel.create(buyerTransactionData),
          TransactionModel.create(sellerTransactionData),
        ]);

        
        await this.updatePurchasedStocks([buyerTransactionData, sellerTransactionData]);
  
        // Update last price of the stock
        await this.updateLastPrice(order.symbol, matchingOrder.price);
  
        // Remove matching order from order book
        await OrderModel.create(order);
        await OrderBookModel.deleteOne({ _id: matchingOrder._id });

        await OrderModel.updateMany(
          { _id: { $in: [order._id, matchingOrder._id] } },
          { $set: { status: 'completed' } }
        );
        
      } 
      else if(matchingOrder && (matchingOrder.transactionType === 'buy' && order.transactionType === 'sell')) {
        // Generate transaction ID
        const transactionID = this.generateTransactionID();
        // Create transactions for buyer and seller
        const buyer = await UserModel.findOne({_id: matchingOrder.userID});
        if(!buyer) throw new Error("Buyer not found"); 
        const buyerTransactionData: Transaction = {
          transactionID,
          userID: matchingOrder.userID,
          transactionType: matchingOrder.transactionType,
          symbol: matchingOrder.symbol,
          price: Number(order.price),
          quantity: Math.min(matchingOrder.quantity, order.quantity),
          timestamp: new Date(),
          status: 'completed',
        };
        const {balance: currentBuyerBalance} = buyer;
        const totalDeductionValue = buyerTransactionData.price * buyerTransactionData.quantity;
        if(totalDeductionValue>currentBuyerBalance) throw new Error("Buyer has insufficient Balance!");

        const seller  = await UserModel.findOne({_id: order.userID});
        if(!seller) throw new Error("Seller not found");
        const sellerTransactionData: Transaction = {
          transactionID,
          userID: order.userID,
          transactionType: oppositeTransactionType,
          symbol: order.symbol,
          price: Number(order.price),
          quantity: buyerTransactionData.quantity,
          timestamp: new Date(),
          status: 'completed',
        };

        const {balance: currentSellerBalance} = seller;
        const updatedBuyerBalance = currentBuyerBalance - totalDeductionValue;
        await this.profileServices.updateUserBalance(buyerTransactionData.userID, updatedBuyerBalance);

        const updatedSellerBalance = currentSellerBalance + totalDeductionValue;
        await this.profileServices.updateUserBalance(sellerTransactionData.userID, updatedSellerBalance);
      
        // Create transactions
        await Promise.all([
          TransactionModel.create(buyerTransactionData),
          TransactionModel.create(sellerTransactionData),
        ]);

        
        await this.updatePurchasedStocks([buyerTransactionData, sellerTransactionData]);
  
        // Update last price of the stock
        await this.updateLastPrice(order.symbol, matchingOrder.price);
  
        // Remove matching order from order book
        await OrderModel.create(order);
        await OrderBookModel.deleteOne({ _id: matchingOrder._id });

        await OrderModel.updateMany(
          { _id: { $in: [order._id, matchingOrder._id] } },
          { $set: { status: 'completed' } }
        );
        
      }
      else {
        // If no matching order is found, create a new entry in the order book
        await OrderBookModel.create({
          userID:order.userID,
          symbol: order.symbol,
          orderType: order.orderType,
          transactionType: order.transactionType,
          price: order.price,
          quantity: order.quantity,
          status: order.status
        });
      }
    } catch (error: any) {
      throw new Error('Failed to update order book: ' + error.message);
    }
  }

  private generateTransactionID = (): string => {
    return uuidv4();
  }

  async placeOrder(orderData: OrderModelInterface): Promise<void> {
    try {
      if(orderData.transactionType === 'sell'){
        const existingStock = await PurchasedStockModel.findOne({
          userID: orderData.userID,
          symbol: orderData.symbol,
        });

        if(!existingStock) throw new Error("No Shares are available to sell!");
        const orderQuantity = orderData.quantity;
        const { shares } = existingStock;
        if(orderQuantity>shares) throw new Error(`Only ${shares} shares are available to sell!`);
      }
      else if(orderData.transactionType === 'buy'){
        const stock = await StockModel.findOne({
          symbol: orderData.symbol
        });
        
        if(!stock) throw new Error(`${orderData.symbol} Stock doesn't exist`);
        const { quantity } = stock;
        const orderQuantity = orderData.quantity;
        if(orderQuantity>quantity) throw new Error("Shares not available!");
      }
      // If it's a market order, fetch the last price from the stock model
      if (orderData.orderType === 'market') {
        orderData.price = await this.getLastPrice(orderData.symbol);
        if (orderData.price === null) {
          throw new Error('Failed to fetch last price for the symbol');
        }
      }
      orderData.status = 'pending';
    
      await this.updateOrderBook(orderData);
    } catch (error: any) {
      throw new Error('Failed to place order: ' + error.message);
    }
  }
}

export default OrderService;
