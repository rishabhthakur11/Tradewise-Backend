import UserType from "./user.interface";
export interface RegisterReqObj{
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    dateOfBirth: string;
    profileImgUrl: string;
    phone: string;
}

export interface RegisterResObj {
    accessToken: string;
    refreshToken: string;
    user?: UserType // temporary optional chaining
}