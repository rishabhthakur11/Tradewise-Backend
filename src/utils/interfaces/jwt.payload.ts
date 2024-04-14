import { JwtPayload } from "jsonwebtoken";
export default interface customJwtPayload extends JwtPayload {
    _id: string;
    email: string;
}