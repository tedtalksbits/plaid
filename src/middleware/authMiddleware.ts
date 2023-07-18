import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';
export const verifySessionAndToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.session;
  if (!token) {
    return res
      .status(403)
      .json({ message: 'Forbidden: Missing import security token' });
  }

  try {
    verifyToken(token);
    next();
    return;
  } catch (error) {
    console.log(error);

    return res.status(401).json({ message: 'Unathorized: Token is invalid' });
  }
};
