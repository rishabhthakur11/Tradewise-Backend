import { Router, Request, Response } from "express";
import Controller from "../../utils/interfaces/controller.interface";
import { UpdatePasswordObj, UpdateProfileReqObj } from "../../utils/interfaces/user.profile";
import UserModel from "../../models/user.model";
import bcrypt from "bcryptjs";
import ProfileServices from "../../services/profile.services";
import PurchasedStockModel from "../../models/purchasedStock.model";

export default class ProfileController implements Controller{
    public path: string;
    public router: Router;
    private profileService = new ProfileServices();
    constructor() {
        this.path = "/user/profile";
        this.router = Router();
        this.initialiseRoutes();
      }
    
      private initialiseRoutes(): void {
        this.router.put(`${this.path}/update`,this.updateProfile);
        this.router.put(`${this.path}/updatePassword`,this.updatePassword);
        this.router.post(`${this.path}/getUserBalance`, this.getUserBalance);
        this.router.put(`${this.path}/balance/add`,this.addUserBalance); 
        this.router.put(`${this.path}/balance/deduct`,this.deductUserBalance); 
        this.router.post(`${this.path}/portfolio`, this.getStockPortfolio);
        
      }

      private getStockPortfolio = async (
        req: Request,
        res: Response
      ): Promise<Response | void> => {
       try {
        type PortfolioReqObj = {
          userID: string
        };
        const reqObj:PortfolioReqObj = req.body;
        const { userID } = reqObj;
        if(!userID) return res.json({success: false, message: "UserId is required!"});
        const portfolio = await PurchasedStockModel.find({userID});
        if(!portfolio) return res.status(400).json({success: false, message:"No stocks in portfolio!"});
        return res.status(200).json({success: true, message:"Portfolio Fetched successfully!", data: portfolio});
        
       } catch (error) {
        res.status(404).json({ success:false, message:"Error fetching portfolio!", error});
       }
      }

      private updateProfile = async (
        req: Request,
        res: Response
      ): Promise<Response | void> => {
        try {
          const reqObj:UpdateProfileReqObj = req.body;
          const {_id, phone, dateOfBirth, profileImgUrl } = reqObj;
          const existingUser = await UserModel.findOne({ _id });
          if(!existingUser) return res.status(400).json({ success:false, message: "User doesn't exists."});

          let updatedUser = {};
          if(phone){ 
            if(existingUser.phone === phone) return res.status(400).json({ success:false, message: "Updated Phone Number already exists."});
            updatedUser = {...updatedUser, phone};
          }
          if(dateOfBirth)
          {
            if(existingUser.dateOfBirth === dateOfBirth) return res.status(400).json({ success:false, message: "Updated Date Of Birth already exists."});
            updatedUser = {...updatedUser, dateOfBirth};
          } 
          if(profileImgUrl){
            if(existingUser.profileImgUrl === profileImgUrl) return res.status(400).json({ success:false, message: "Updated Profile Photo same as current profile photo"});
            updatedUser = {...updatedUser, profileImgUrl};
          }

          const isUserUpdated = await UserModel.findByIdAndUpdate(_id, updatedUser);
          if(!isUserUpdated) return res.json({success:false, message:"User not updated"});
          
          const resObj = {...updatedUser};
          res.status(200).json({success:true, message:"User Updated!", data:{...resObj}});
          
        } catch (error) {
          res.status(404).json({ success:false, message:"Error updating profile", error});
        }
        



      

      }

      private updatePassword = async (
        req: Request,
        res: Response
      ): Promise<Response | void> => {
        try {
            const reqObj:UpdatePasswordObj = req.body;
        const {_id, password, newPassword} = reqObj;
        const existingUser = await UserModel.findOne({ _id });
        if(!existingUser) return res.status(400).json({ success:false, message: "User doesn't exists."});

        const passwordCorrect = await bcrypt.compare(password, String(existingUser.password));
        if (!passwordCorrect) return res.status(400).json({ message: "Invalid user password!" });

        const salt = await bcrypt.genSalt(12);
        const newPasswordHashed = await bcrypt.hash(newPassword, salt);
        await UserModel.findByIdAndUpdate(_id, {password: newPasswordHashed});
        res.status(200).json({success:true, message: "Password successfully updated!", data:null });
            
        } catch (error) {
            res.json({success:false, message: "Error updating password", error}) 
        }
      }

      private getUserBalance = async (
        req: Request,
        res: Response
      ): Promise<Response | void> => {
        try {
          const reqObj:{_id:string} = req.body;
        const {_id} = reqObj;
        const existingUser = await UserModel.findOne({ _id });
        if(!existingUser) return res.status(400).json({ success:false, message: "User doesn't exists."});
        const {balance} = existingUser;
        res.status(200).json({success:true, message: "Balance Successfully Fetched!", data:{balance} });
        
        } catch (error) {
          res.status(400).json({success:false, message:"Error Fetching Balance", error});
        }
      }

      public addUserBalance = async (
        req: Request,
        res: Response
      ): Promise<Response | void> => {
        try {
          const reqObj:{_id: string, amount: number} = req.body;
        const {_id, amount} = reqObj;
        const existingUser = await UserModel.findOne({ _id });
        if(!existingUser) return res.status(400).json({ success:false, message: "User doesn't exists."});
        const {balance:currentBalance} = existingUser;
        const updatedBalance = Math.round((currentBalance + amount) * 100) / 100;
        if(updatedBalance > 10000000) return res.status(200).json({success:false, message:"Maximum limit exceeded!", data:{currentBalance} });
        await this.profileService.updateUserBalance(_id , updatedBalance);
        res.status(200).json({success:true, message: "Amount Successfully added!", data:{balance:updatedBalance.toString()} });
        } catch (error) {
          res.status(400).json({success:false, message:"Error Updating Balance", error});
        } 
      }

      public deductUserBalance = async (
        req: Request,
        res: Response
      ): Promise<Response | void> => {
        try {
          const reqObj:{_id: string, amount: number} = req.body;
        const {_id, amount} = reqObj;
        const existingUser = await UserModel.findOne({ _id });
        if(!existingUser) return res.status(400).json({ success:false, message: "User doesn't exists."});
        const {balance:currentBalance} = existingUser;
        const updatedBalance = Math.round((currentBalance - amount) * 100) / 100;
        if(updatedBalance < 10000000) return res.status(200).json({success:false, message:"Insufficient Balance!", data:{currentBalance} });
        await this.profileService.updateUserBalance(_id , updatedBalance);
        res.status(200).json({success:true, message: "Amount Successfully deducted!", data:{balance:updatedBalance.toString()} });
        } catch (error) {
          res.status(400).json({success:false, message:"Error Updating Balance", error});
        } 
      }
}