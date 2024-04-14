import { PRODUCT_NAME } from "../config/config";

export default class MailTemplate{
    forgotPassword = (name:string,otp:number) =>
    {
        const subject = `Oh no! A password reset? No biggie! 🚀`;
        const text = 
`Hey ${name},
We hear you're in the market for a password reset! Don't worry, it's not the end of the trading world. We've got your back with a one-time password (OTP) to help you get back in the game.
Your magical OTP for resetting your password is: ${otp}
Remember, this OTP is valid for a limited time only, so use it before it starts investing in something else! If you didn't request a password reset, feel free to ignore this email. Your account is still safe and sound.
If you encounter any hiccups or need help, our support team is ready to swoop in like a market-saving hero!
Keep up the great trades!
Cheers,
${PRODUCT_NAME} Support Team
        `
        return {subject,text};
    }

}
