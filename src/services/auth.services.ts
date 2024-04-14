import {
  RegisterReqObj,
  RegisterResObj,
} from "../utils/interfaces/user.register";
import { LoginReqObj, LoginResObj } from "../utils/interfaces/user.login";
import UserModel from "../models/user.model";
import UserType from "../utils/interfaces/user.interface";
import { UserFilter } from "../utils/interfaces/user.interface";
//Contains main logic which deals with MongoDB CRUD operations using Mongoose.
export default class AuthServices {
  public RegisterUserOnDb = async (user:UserType) => await UserModel.create(user);

  public GenerateUserID = (first_name:string, dateOfBirth:string): string => {
    const dob = new Date(dateOfBirth);
    const rnd = Math.ceil(Math.random()*100000);
    let userID = `${first_name}${rnd}_${dob.getFullYear()}`;
    return userID;
  }

  public GenerateRandomPassword = ():string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 15; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
  }

  public findUser = async (filter:UserFilter) => await UserModel.findOne(filter);
}
