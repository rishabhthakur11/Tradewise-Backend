import { Document } from "mongoose";

//Interface for User
export default interface UserType {
  _id?: string
  userID: string;
  first_name: string;
  last_name:string;
  email: string;
  password: string;
  phone?: string;
  balance: number;
  profileImgUrl: string;
  dateOfBirth?: string;
}

export interface UserFilter{
  _id?: string
  userID?:string;
  email?:string;
}