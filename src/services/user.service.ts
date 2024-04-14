import UserModel from "../models/user.model";

class UserService {
  updateUserBalance = async (userID: string, balanceChange: number): Promise<void> => {
    try {
      const user = await UserModel.findById(userID);
      if (!user) {
        throw new Error("User not found");
      }
      user.balance += balanceChange;
      await user.save();
    } catch (error: any) {
      throw new Error("Failed to update user balance: " + error.message);
    }
  }
}

export default UserService;
