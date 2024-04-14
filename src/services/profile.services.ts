
import UserModel from "../models/user.model";

  //Contains main logic which deals with MongoDB CRUD operations using Mongoose.
export default class ProfileServices {
    public updateUserBalance = async (_id: string, updatedBalance:number):Promise<void> => {
      try {
      await UserModel.findByIdAndUpdate(_id, {balance: updatedBalance});
      } catch (error) {
        console.log("Error Adding Balance: ", error);
      } 
    }
}
  