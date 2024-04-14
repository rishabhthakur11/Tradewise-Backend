import UserType from "./user.interface";
export interface LoginReqObj {
    userID: string
    email: string;
    password: string;
}

export interface LoginResObj {
    accessToken: string;
    refreshToken: string;
    user?: UserType // temporary optional chaining
}