import { Request, Response } from 'express';
import { sqlQuery } from '../lib/querySql';
import { v4 as uuidv4 } from 'uuid';
import { UserType } from '../user/userType';
import { generateToken } from '../lib/jwt';
import CryptoJS from 'crypto-js';
const TABLE_NAME = 'users';
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, username, password } = req.body;
    if (!name || !username || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const foundUser = await sqlQuery.select<Partial<UserType>>(TABLE_NAME, {
      username,
    });

    if (foundUser.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const newUserClientId = uuidv4();

    if (!process.env.CRYPTO_SECRET) {
      console.log(
        'Missing required environment variables in: ' +
          __filename +
          'registerUser()'
      );
      return res.status(500).json({ message: 'Something went wrong' });
    }

    const encryptedPassword = CryptoJS.AES.encrypt(
      password,
      process.env.CRYPTO_SECRET
    ).toString();

    const result = await sqlQuery.save<Partial<UserType>>(TABLE_NAME, {
      name,
      username,
      password: encryptedPassword,
      client_id: newUserClientId,
    });

    return res.status(201).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.code });
  }
};

export const authenticateUser = async (req: Request, res: Response) => {
  console.log('authenticateUser()');
  try {
    const { username, password } = req.body as {
      username: string;
      password: string;
    };

    if (!username || !password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const foundUser = await sqlQuery.select<Partial<UserType>>(TABLE_NAME, {
      username,
    });

    if (foundUser.length === 0) {
      return res.status(403).json({ error: 'Invalid username or password' });
    }

    const user = foundUser[0];

    if (!process.env.CRYPTO_SECRET || !process.env.JWT_SECRET) {
      console.log(
        'Missing required environment variables in: ' +
          __filename +
          'authenticateUser()'
      );
      return res.status(500).json({ message: 'Something went wrong' });
    }

    const decryptedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.CRYPTO_SECRET
    ).toString(CryptoJS.enc.Utf8);

    if (decryptedPassword !== password) {
      console.log('Invalid username or password');
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = generateToken(user);

    req.session = {
      token,
      user: {
        client_id: user.client_id as string,
        user_id: user.id,
        username: user.username,
      },
    };

    await sqlQuery.update<Partial<UserType>>(
      TABLE_NAME,
      {
        ...user,
        last_login: new Date(),
      },
      {
        id: user.id,
      }
    );
    const { password: _, access_token: __, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    req.session = null as any;
    return res.status(200).json({ message: 'Successfully logged out' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const authUser = req.session?.user;
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [user] = await sqlQuery.select<Partial<UserType>>(TABLE_NAME, {
      id: authUser?.user_id,
      username: authUser?.username,
    });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { password: _, access_token: __, ...userWithoutPassword } = user;
    const userResponse = {
      ...userWithoutPassword,
      isAuthenticated: true,
      hasAccessToken: !!user.access_token,
    };
    return res.status(200).json(userResponse);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};
