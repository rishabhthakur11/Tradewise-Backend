import { Router, Request, Response } from "express";
import AuthServices from "../../services/auth.services";
import Controller from "../../utils/interfaces/controller.interface";
import {
  RegisterReqObj,
  RegisterResObj,
} from "../../utils/interfaces/user.register";
import { LoginReqObj, LoginResObj } from "../../utils/interfaces/user.login";
import UserModel from "../../models/user.model";
import bcrypt from "bcryptjs";
import UserType from "../../utils/interfaces/user.interface";
import customJwtPayload from "../../utils/interfaces/jwt.payload";
import TokenService from "../../services/tokenService";
import OtpService from "../../services/otpService";
import MailService from "../../services/mailService";
import { TYPE_FORGOT_PASSWORD } from "../../config/config";

export default class AuthController implements Controller {
  public path: string;
  public router: Router;
  private AuthServices = new AuthServices();
  private tokenService = new TokenService();
  private otpService = new OtpService();
  private mailService = new MailService();
  constructor() {
    this.path = "/auth";
    this.router = Router();
    this.initialiseRoutes();
  }

  private initialiseRoutes(): void {
    this.router.post(`${this.path}/register`, this.registerUser);
    this.router.post(`${this.path}/login`, this.loginUser);
    this.router.get(`${this.path}/refresh`, this.refreshUser);
    this.router.post(`${this.path}/forgot`, this.forgot);
    this.router.post(`${this.path}/reset`, this.reset);
    this.router.get(`${this.path}/logout`, this.logout);
  }

  private registerUser = async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    try {
      const reqObj: RegisterReqObj = req.body;
      const { first_name, email, password, dateOfBirth } = reqObj;

      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists." });
      }
      const salt = await bcrypt.genSalt(12);
      const passwordHashed = await bcrypt.hash(password, salt);
      const userID: string = this.AuthServices.GenerateUserID(
        first_name,
        dateOfBirth
      );
      const newUser: UserType = {
        userID,
        ...reqObj,
        password: passwordHashed,
        balance: 0,
      };

      const registeredUser = await this.AuthServices.RegisterUserOnDb(newUser);
      const { _id, last_name, phone, profileImgUrl, balance } = registeredUser;
      const respData = {
        _id,
        userID,
        first_name,
        last_name,
        email,
        dateOfBirth,
        phone,
        profileImgUrl,
        balance,
      };

      const payload: customJwtPayload = {
        _id,
        email,
      };


      const { accessToken, refreshToken } =
        this.tokenService.generateToken(payload);
      console.log("Access Token", accessToken);
      console.log("Refresh Token", refreshToken);
      await this.tokenService.storeRefreshToken(_id, refreshToken);
      res.cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
      });
      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
      });
      res.json({
        success: true,
        message: "Registration Successfull",
        data: { ...respData },
      });
    } catch (error) {
      res.json({
        success: false,
        message: "Registration Unsuccessfull",
        error,
      });
    }
  };

  private loginUser = async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    try {
      const reqObj: LoginReqObj = req.body;
      const { email, password, userID } = reqObj;
      let existingUser;
      if (email) existingUser = await UserModel.findOne({ email });
      else if (userID) existingUser = await UserModel.findOne({ userID });

      if (!existingUser) {
        return res
          .status(404)
          .json({ success: false, message: "User doesn't exist." });
      }

      const passwordCorrect = await bcrypt.compare(
        password,
        String(existingUser.password)
      );
      if (!passwordCorrect) {
        return res.status(400).json({ message: "Invalid login credentials." });
      }

      const {
        _id,
        first_name,
        last_name,
        dateOfBirth,
        phone,
        profileImgUrl,
        balance
      } = existingUser;

      const respData = {
        _id,
        "userID": existingUser.userID,
        first_name,
        last_name,
        email,
        dateOfBirth,
        phone,
        profileImgUrl,
        balance,
      };

      const payload: customJwtPayload = {
        _id,
        "email": existingUser.email
      };

      const { accessToken, refreshToken } =
        this.tokenService.generateToken(payload);
      console.log("Access Token", accessToken);
      console.log("Refresh Token", refreshToken);
      await this.tokenService.storeRefreshToken(_id, refreshToken);

      res.cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
      });
      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
      });
      res.json({
        success: true,
        message: "Login Successfull",
        data: { ...respData },
      });
    } catch (error) {
      res.json({
        success: false,
        message: "Login Unsuccessfull",
        error,
      });
    }
  };

  private refreshUser = async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    try {
      const { refreshToken: refreshTokenFromCookie } = req.cookies;
      if (!refreshTokenFromCookie)
        return res
          .status(401)
          .json({ success: false, message: "Unauthoried Access!" });
      const payload = (await this.tokenService.verifyRefreshToken(
        refreshTokenFromCookie
      )) as customJwtPayload;
      const { _id } = payload
      const token = await this.tokenService.findRefreshToken(
        _id,
        refreshTokenFromCookie
      );

      if (!token) {
        res.clearCookie("refreshToken");
        res.clearCookie("accessToken");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized Access" });
      }

      const user = await this.AuthServices.findUser({ _id });
      if (!user) return res.status(403).json({ success: false, message: "User not found" });

      const newPayload: customJwtPayload = {
        _id,
        "email": user.email
      };
      const { accessToken, refreshToken } =
        this.tokenService.generateToken(newPayload);

      const isTokenUpdated = await this.tokenService.updateRefreshToken(
        _id,
        refreshTokenFromCookie,
        refreshToken
      );
      if (!isTokenUpdated) return res.status(403).json({ success: false, message: "Update of token failed" });
      const {
        first_name,
        last_name,
        userID,
        email,
        dateOfBirth,
        phone,
        profileImgUrl,
        balance
      } = user;

      const respData = {
        _id,
        userID,
        first_name,
        last_name,
        email,
        dateOfBirth,
        phone,
        profileImgUrl,
        balance,
      };

      res.cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
      });
      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
      });

      res.status(200).json({
        success: true,
        message: "Secure access has been granted",
        data: { ...respData },
      });
    } catch (error) {
      res.json({
        success: false,
        message: "Error Refreshing access token",
        error,
      });
    }
  };

  private forgot = async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    const { email: requestEmail } = req.body;
    if (!requestEmail)
      return res.status(403).json({ success: false, message: "Bad Request" });
    const user = await UserModel.findOne({ email: requestEmail });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User doesn't exists." });
    const { _id: userId, first_name, email } = user;
    const otp = this.otpService.generateOtp();
    const type = TYPE_FORGOT_PASSWORD;
    await this.otpService.removeOtp(userId);
    await this.otpService.storeOtp(userId, otp, Number(type));
    await this.mailService.sendForgotPasswordMail(first_name, email, otp);
    res.json({
      success: true,
      message: "Email has been sent to your email address",
    });
  };

  private reset = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { email, otp, password } = req.body;
      if (!email || !otp || !password)
        return res.status(403).json({ success: false, message: "Bad Request" });
      const user = await UserModel.findOne({ email });
      if (!user)
        return res
          .status(400)
          .json({ success: false, message: "User doesn't exists." });
      const type = TYPE_FORGOT_PASSWORD;
      const { _id: userId } = user;
      const response = await this.otpService.verifyOtp(
        userId,
        otp,
        Number(type)
      );
      console.log("Response", response);
      if (response === "INVALID")
        return res.status(200).json({ success: false, message: "Invalid OTP" });
      if (response === "EXPIRED")
        return res
          .status(200)
          .json({ success: false, message: "Otp has been Expired" });

      const salt = await bcrypt.genSalt(12);
      const newPasswordHashed = await bcrypt.hash(password, salt);
      await UserModel.findByIdAndUpdate(userId, {
        password: newPasswordHashed,
      });

      res.json({
        success: true,
        message: "Password has been reset successfully",
      });
    } catch (error) {
      res.json({
        success: false,
        message: "Failed to Reset your password",
        error,
      });
    }
  };

  private logout = async (req: Request, res: Response): Promise<any> => {
    try {
      const { refreshToken } = req.cookies;
      //const { _id } = req.user as UserType;
      //const response = await this.tokenService.removeRefreshToken(String(_id), refreshToken);
      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');
      return res.json({ success: true, message: 'Logout Successfully' });
    } catch (error) {
      res.json({
        success: false,
        message: "Logout Unsuccessful",
        error,
      });

    }

  }
}
