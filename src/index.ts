
import App from './app';
import {PORT, MONGODB_URL} from './config/config'
import OrderController from './controllers/stock.controllers/order.controller';
import StockController from './controllers/stock.controllers/stockController';
import TransactionController from './controllers/stock.controllers/transaction.controller';
import AuthController from './controllers/user.controllers/AuthController';
import GoogleAuthControllers from './controllers/user.controllers/GoogleAuthControllers';
import ProfileController from './controllers/user.controllers/ProfileControllers';


const app = new App(
    [new AuthController(), new StockController(), new GoogleAuthControllers(),  new ProfileController(), new OrderController(), new TransactionController()],
    Number(PORT),
    String(MONGODB_URL),

);

app.listen();
