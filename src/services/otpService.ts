import crypto from "crypto";
import OtpModel from "../models/otp.model";

export default class OtpService {

    generateOtp = () => crypto.randomInt(100000,999999);

    storeOtp = async (userId:string,otp:number,type:number) => await OtpModel.create({userId,otp,type});

    removeOtp = async (userId:string) => await OtpModel.deleteOne({userId});

    verifyOtp = async (userId:string,otp:number,type:number) =>
    {
        const otpData = await OtpModel.findOne({userId,otp,type});
        if(otpData)
        {
            const now = new Date(1635966633159);
            await this.removeOtp(userId);
            if(now<otpData.expire)
            {
                return 'VALID';
            }
            else
                return 'EXPIRED'
        }
        else
            return 'INVALID'
    }   

}