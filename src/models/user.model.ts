import { Schema, model } from "mongoose";
import UserType from "../utils/interfaces/user.interface";

//User Schema
const UsersSchema = new Schema(
  {
    userID: { type: String, required: true },
    first_name: { type: String,required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String},
    phone: { type: String},
    balance: { type: Number, required: true, min:0},
    profileImgUrl: { type: String, required: true},
    dateOfBirth: {type: String}
  }
);

  
export default model<UserType>("Users", UsersSchema);