import { Request, Response, Router } from 'express';
import { StockModel } from '../../utils/interfaces/stock.interface';
import Controller from '../../utils/interfaces/controller.interface';
import StockService from '../../services/stock.service';

class StockController implements Controller {
  public path: string;
  public router: Router;
  public stockService = new StockService();

  constructor() {
    this.path = "/stocks";
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes = (): void => {
    this.router.get(`${this.path}`, this.getAllStocks);
    this.router.get(`${this.path}/:symbol`, this.getStockBySymbol);
    this.router.post(`${this.path}`, this.createStock);
  };

  private getAllStocks = async (req: Request, res: Response): Promise<void> => {
    try {
      const stocks = await this.stockService.getAllStocks();
      res.status(200).json({ status: 'success', data: stocks });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  };

  private getStockBySymbol = async (req: Request, res: Response): Promise<void> => {
    try {
      const symbol = req.params.symbol;
      const stock = await this.stockService.getStockBySymbol(symbol);
      if (!stock) {
        res.status(404).json({ status: 'error', message: 'Stock not found' });
      } else {
        res.status(200).json({ status: 'success', data: stock });
      }
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  };

  private createStock = async (req: Request, res: Response): Promise<void> => {
    try {
      const stockData: StockModel = req.body;
      const createdStock = await this.stockService.createStock(stockData);
      res.status(201).json({ status: 'success', data: createdStock });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  };
}

export default StockController;
