import { Request, Response, Router } from 'express';
import OrderService from '../../services/order.service';
import { OrderModel } from '../../models/order.model'; // Import OrderModelInterface from the correct location

class OrderController {
  public path: string;
  public router: Router;
  private orderService: OrderService;

  constructor() {
    this.path = '/orders';
    this.router = Router();
    this.orderService = new OrderService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(`${this.path}/placeOrder`, this.placeOrder);
  }

  private placeOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderData: OrderModel = req.body;
      await this.orderService.placeOrder(orderData);
      res.status(201).json({ status: 'success', message: 'Order placed successfully' });
    } catch (error:any) {
      res.status(500).json({ status: 'error', message: 'Failed to place order', error: error.message });
    }
  };
}

export default OrderController;
