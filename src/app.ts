import express, { Application } from "express";
import dotenv from "dotenv";
import connectDb from "./config/connectDb";
import Controller from "./utils/interfaces/controller.interface";
import "./utils/passport";
import passport from "passport";
const session = require('express-session');
const cors = require('cors');
import StockController from "./controllers/stock.controllers/stockController";



dotenv.config();
const corsOption = {
  credentials: true,
  origin: ['http://localhost:3000', 'http://1.1.1.111:3000']
}
class App {
  public express: Application;
  public port: number;
  public dbUrl: string;


  constructor(controllers: Controller[], port: number, dbUrl: string) {
    this.express = express();
    this.port = port;
    this.dbUrl = dbUrl;
    this.initialiseDB();
    this.initialiseMiddleware();
    this.initialiseControllers(controllers);

  }


  // Intializes all the middlewares
  private initialiseMiddleware(): void {
    // parse application/json
    this.express.use(express.json());
    this.express.use(cors(corsOption));
    // parse application/x-www-form-urlencoded
    this.express.use(express.urlencoded({ extended: false }));
    this.express.use(session({
      secret: 'secret',
      resave: false,
      saveUninitialized: false
    }));
    this.express.use(passport.initialize());
    this.express.use(passport.session());
  }


  // Intializes the Mongo DB
  private initialiseDB(): void {
    const url: string = this.dbUrl;
    connectDb({ url });
  }

  private initialiseControllers(controllers: Controller[]): void {
    controllers.forEach((controller: Controller) => {
      this.express.use("/api", controller.router);
    });
  }

  //Starts listening to the requests
  public listen(): void {
    this.express.listen(this.port, () => {
      console.log(`Express listening on port ${this.port}`);
    });
  }
}

export default App;