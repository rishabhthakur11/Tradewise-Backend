export interface UpdateProfileReqObj{
    _id: string;
    phone?: string;
    profileImgUrl?:string
    dateOfBirth?:string
}

export interface UpdatePasswordObj{
    _id: string;
    password: string;
    newPassword: string;
}