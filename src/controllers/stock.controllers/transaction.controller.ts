import { Request, Response, Router } from "express";
import TransactionService from "../../services/transaction.service";

class TransactionController {
  public path: string;
  public router: Router;
  private transactionService: TransactionService;

  constructor() {
    this.path = '/transactions';
    this.router = Router();
    this.transactionService = new TransactionService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(`${this.path}`, this.getAllTransactions);
    this.router.get(`${this.path}/symbol/:symbol`, this.getTransactionsBySymbol);
    this.router.post(`${this.path}/user/investment`, this.getTransactionsByUserId);
    this.router.get(`${this.path}/id/:transactionId`, this.getTransactionById);
    this.router.post(`${this.path}/execute`, this.executeTransaction);
  }

  private getAllTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const transactions = await this.transactionService.getAllTransactions();
      res.status(200).json({ status: 'success', data: transactions });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: 'Failed to get all transactions', error: error.message });
    }
  };

  private getTransactionsBySymbol = async (req: Request, res: Response): Promise<void> => {
    try {
      const symbol = req.params.symbol;
      const transactions = await this.transactionService.getTransactionsBySymbol(symbol);
      res.status(200).json({ status: 'success', data: transactions });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: 'Failed to get transactions by symbol', error: error.message });
    }
  };

  private getTransactionsByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
      const reqObj: { userId: string } = req.body;
      const { userId } = reqObj;
      const transactions = await this.transactionService.getTransactionsByUserId(userId);
      res.status(200).json({ success: 'true', data: transactions });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: 'Failed to get transactions by user ID', error: error.message });
    }
  };

  private getTransactionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const transactionId = req.params.transactionId;
      const transaction = await this.transactionService.getTransactionById(transactionId);
      if (!transaction) {
        res.status(404).json({ status: 'error', message: 'Transaction not found' });
      } else {
        res.status(200).json({ status: 'success', data: transaction });
      }
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: 'Failed to get transaction by ID', error: error.message });
    }
  };

  private executeTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const transactionData = req.body;
      await this.transactionService.executeTransaction(transactionData);
      res.status(201).json({ status: 'success', message: "Transaction executed successfully" });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  };
}

export default TransactionController;
