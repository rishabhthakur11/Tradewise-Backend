import jwt from 'jsonwebtoken';
import {ACCESS_TOKEN_SECRET_KEY, REFRESH_TOKEN_SECRET_KEY} from '../config/config';
import CustomJwtPayload from '../utils/interfaces/jwt.payload';
import tokenModel from '../models/token.model';

const accessTokenSecretKey:string = String(ACCESS_TOKEN_SECRET_KEY);
const refreshTokenSecretKey:string = String(REFRESH_TOKEN_SECRET_KEY);
export default class TokenService {

    public generateToken = (payload:CustomJwtPayload) =>
    {
        const accessToken = jwt.sign(payload, accessTokenSecretKey,{
            expiresIn:'1h'
        });
        const refreshToken = jwt.sign(payload, refreshTokenSecretKey,{
            expiresIn:'1y'
        });
        return {accessToken,refreshToken};
    }

    public storeRefreshToken = async (userID: string, token:string) =>
    {
        const tokens = {token}
        const isExist = await tokenModel.exists({userID})
        if(!isExist)
            return await tokenModel.create({userID,tokens})
        else
            return await tokenModel.findOneAndUpdate({userID},{$push:{tokens}});
    }

    public removeRefreshToken = async (userID:string, token:string) =>
    {
        const tokens = {token}
        return await tokenModel.updateOne({userID,'tokens.token':token},{$pull:{tokens}});
    }

    public verifyRefreshToken =  (refreshToken: string) => jwt.verify(refreshToken,refreshTokenSecretKey);

    public verifyAccessToken = (accessToken: string) => jwt.verify(accessToken,accessTokenSecretKey);

    public findRefreshToken = async (userID:string, token:string) => await tokenModel.findOne({userID,'tokens.token':token}).select({tokens:{$elemMatch:{token}}});

    public updateRefreshToken = async (userID:string ,oldToken:string ,token:string) => await tokenModel.findOneAndUpdate({userID,'tokens.token':oldToken},{$set:{'tokens.$.token':token}});

}
