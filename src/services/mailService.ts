import transport from "../config/mailConfig";
import { SMTP_AUTH_USER } from "../config/config";
import MailTemplate from "../templates/mailTemplate";
const smtpAuthUser = SMTP_AUTH_USER;

export default class MailService{
    private mailTemplate = new MailTemplate();
    sendForgotPasswordMail = async (name:string,email:string,otp:number) =>
    {
        const {subject,text} = this.mailTemplate.forgotPassword(name,otp);
        return await this.sendMail(email,subject,text);
    }
    sendMail  = async (to:string,subject:string,text:string) =>
    {
        const mailOption = {
            from:smtpAuthUser,
            to,
            subject,
            text
        }
        await transport.sendMail(mailOption,(err:any,info:any)=>
        {
            console.log(err);
            console.log(info);
        })

    }

}
