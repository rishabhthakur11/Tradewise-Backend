import UserType from "../../utils/interfaces/user.interface";

declare global {
  namespace Express {
    interface User extends UserType {}
  }
}