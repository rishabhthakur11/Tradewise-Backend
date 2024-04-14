import StockModel, { StockModel as StockModelInterface } from '../models/stock.model';

class StockService {
  getAllStocks = async (): Promise<StockModelInterface[]> => {
    return await StockModel.find();
  }

  getStockBySymbol = async (symbol: string): Promise<StockModelInterface | null> => {
    return await StockModel.findOne({ symbol });
  }

  createStock = async (data: StockModelInterface): Promise<StockModelInterface> => {
    return await StockModel.create(data);
  }

  updateStockQuantity = async (symbol: string, quantityChange: number): Promise<void> => {
    try {
      const stock = await StockModel.findOne({ symbol });
      if (!stock) {
        throw new Error("Stock not found");
      }
      stock.quantity += quantityChange;
      await stock.save();
    } catch (error: any) {
      throw new Error("Failed to update stock quantity: " + error.message);
    }
  }

  decreaseStockQuantity = async (symbol: string, quantityChange: number): Promise<void> => {
    try {
      const stock = await StockModel.findOne({ symbol });
      if (!stock) {
        throw new Error("Stock not found");
      }
      stock.quantity -= quantityChange;
      await stock.save();
    } catch (error: any) {
      throw new Error("Failed to update stock quantity: " + error.message);
    }
  }


  updateStockPrice = async (symbol: string, newPrice: number): Promise<void> => {
    try {
      const stock = await StockModel.findOne({ symbol });
      if (!stock) {
        throw new Error("Stock not found");
      }
      stock.price = newPrice;
      await stock.save();
    } catch (error: any) {
      throw new Error("Failed to update stock price: " + error.message);
    }
  }
}

export default StockService;
