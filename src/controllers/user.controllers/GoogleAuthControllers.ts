import { Router, Request, Response } from "express";
import Controller from "../../utils/interfaces/controller.interface";
import passport from "passport";
import { BASE_URL, CLIENT_URL } from "../../config/config";
import UserType from "../../utils/interfaces/user.interface";
import customJwtPayload from "src/utils/interfaces/jwt.payload";
import TokenService from "../../services/tokenService";

export default class GoogleAuthControllers implements Controller{
    public path:string;
    public router: Router;
    public tokenService = new TokenService();
    constructor() {
        this.path = "/auth/google";
        this.router = Router();
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        this.router.get(`${this.path}/signIn`, passport.authenticate('google', { scope: ['email', 'profile']}, this.signInWithGoogleAuth));
        this.router.get(`${this.path}/callback`, passport.authenticate("google"), this.callbackHit);
        this.router.get(`${this.path}/signOut`, this.signOutFromGoogleAuth);
    }

    private signInWithGoogleAuth = async (
        req: Request,
        res: Response
      ): Promise<Response | void> => {
        console.log("Sign In with Google Initiated!");
        res.redirect(`${BASE_URL}/${this.path}/signIn`);
    }

    private signOutFromGoogleAuth = async (
        req: Request,
        res: Response
      ): Promise<Response | void> => {
        req.logout((err) => console.log("Error",err));
        res.redirect(`${CLIENT_URL}/`);
      }
    

    private callbackHit = async (
        req: Request,
        res: Response
      ): Promise<Response | void> => {
        try {
         const user = req.user;
         if(!user) return res.json({success:false, message:"User not found", data:null});
         
         const {_id ,userID, email, first_name, last_name, phone, dateOfBirth, balance, profileImgUrl} = user;
         
         const payload:customJwtPayload = {
            "_id": String(_id),
            email
        }
        const respData = {
          userID,
          email,
          first_name,
          last_name,
          phone,
          dateOfBirth,
          balance,
          profileImgUrl,
        };
        const {accessToken,refreshToken} = this.tokenService.generateToken(payload);
        console.log("Access Token", accessToken);
        console.log("Refresh Token", refreshToken);
        await this.tokenService.storeRefreshToken(String(user?.userID),refreshToken);
        res.cookie('accessToken',accessToken,{
            maxAge:1000*60*60*24*30,
            httpOnly:true
        });
        res.cookie('refreshToken',refreshToken,{
            maxAge:1000*60*60*24*30,
            httpOnly:true
        })
        res.json({success:true,message:'Google Login Successfull',data:{...respData}});
            
         } catch (error) {
         res.json({success:false,message:'Google Login Unsuccessfull',error});
            
        }  
    }

}