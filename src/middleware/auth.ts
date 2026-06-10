// higher order function =>  return korbe function k

import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

const auth = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "You are not allowed!!" });
    }

    try {
      const decoded = jwt.verify(
        token,
        config.jwt_secret as string,
      ) as JwtPayload;

      console.log({ decoded });

      req.user = decoded;

      // ['admin']
      if (roles.length && !roles.includes(decoded.role)) {
        res.status(500).json({
          error: "Unauthorized",
        });
      }

      next();
    } catch (err: any) {
      return res.status(401).json({ message: "Invalid or expired token!" });
    }
  };
};

export default auth;
