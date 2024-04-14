import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from 'src/config/config';


const jwtSecret:string = String(JWT_SECRET);
export interface request extends Request{
    userId?:string;
}

const auth = async (req: request, res: Response, next: NextFunction) => {
  try {
    const token: string | undefined = req.headers.authorization?.split(" ")[1];
    const isCustomAuth: boolean = token ? token.length < 500 : false;
    let contentDecoded: JwtPayload | null;

    if (token && isCustomAuth) {      
      contentDecoded = jwt.verify(token, jwtSecret!) as JwtPayload;
      req.userId = contentDecoded?.id;
    } else {
      contentDecoded = jwt.decode(token!) as JwtPayload;
      req.userId = contentDecoded?.sub;
    }    
    next();
  } catch (error) {
    res.status(403).json({ message: "Not authenticated!" });
  }
};

export default auth;
