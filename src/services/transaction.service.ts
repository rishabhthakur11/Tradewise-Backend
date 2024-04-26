import { Transaction } from "../utils/interfaces/transaction.interface";
import StockService from "../services/stock.service";
import UserService from "../services/user.service";
import TransactionModel from "../models/transaction.model";

class TransactionService {
  private stockService = new StockService();
  private userService = new UserService();
  private orderBook: Transaction[] = [];

  executeTransaction = async (transactionData: Transaction): Promise<void> => {
    try {
      // Place order in the order book
      this.orderBook.push(transactionData);

      // Update user balances based on transaction type (buy/sell)
      if (transactionData.transactionType === 'buy') {
        await this.updateBuyTransaction(transactionData);
      } else {
        await this.updateSellTransaction(transactionData);
      }

      // Update stock price
      await this.stockService.updateStockPrice(transactionData.symbol, transactionData.price);
    } catch (error: any) {
      throw new Error("Failed to execute transaction: " + error.message);
    }
  }

  private updateBuyTransaction = async (transaction: Transaction): Promise<void> => {
    // Update buyer's balance and stock quantity
    await Promise.all([
      this.userService.updateUserBalance(transaction.userID, -transaction.price * transaction.quantity),
      this.stockService.updateStockQuantity(transaction.symbol, transaction.quantity)
    ]);
  }

  private updateSellTransaction = async (transaction: Transaction): Promise<void> => {
    // Update seller's balance and stock quantity
    await Promise.all([
      this.userService.updateUserBalance(transaction.userID, transaction.price * transaction.quantity),
      this.stockService.updateStockQuantity(transaction.symbol, -transaction.quantity)
    ]);
  }

  getAllTransactions = async (): Promise<Transaction[]> => {
    try {
      const transactions = await TransactionModel.find();
      return transactions;
    } catch (error: any) {
      throw new Error('Failed to get all transactions: ' + error.message);
    }
  }

  getTransactionsBySymbol = async (symbol: string): Promise<Transaction[]> => {
    try {
      const transactions = await TransactionModel.find({ symbol });
      return transactions;
    } catch (error: any) {
      throw new Error('Failed to get transactions by symbol: ' + error.message);
    }
  }

  getTransactionsByUserId = async (userId: string): Promise<Transaction[]> => {
    try {
      const transactions = await TransactionModel.find({ userID: userId });
      return transactions;
    } catch (error: any) {
      throw new Error('Failed to get transactions by user ID: ' + error.message);
    }
  }

  getTransactionById = async (transactionId: string): Promise<Transaction | null> => {
    try {
      const transaction = await TransactionModel.findById(transactionId);
      return transaction;
    } catch (error: any) {
      throw new Error('Failed to get transaction by ID: ' + error.message);
    }
  }
}

export default TransactionService;
