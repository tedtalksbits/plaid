import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { sqlQuery } from '../lib/querySql';
import {
  Configuration,
  PlaidApi,
  Products,
  PlaidEnvironments,
  CountryCode,
} from 'plaid';
import { UserType } from 'src/user/userType';
import moment from 'moment';
dotenv.config();

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID || '';
const PLAID_SECRET = process.env.PLAID_SECRET || '';
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

const PLAID_PRODUCTS = (
  process.env.PLAID_PRODUCTS || Products.Transactions
).split(',') as Products[];

const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'US').split(
  ','
);

const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || '';

let ACCESS_TOKEN = '';
let ITEM_ID = '';
// let PAYNMENT_ID = '';
let TRANSFER_ID = null;

const config = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});

const client = new PlaidApi(config);

export const createLinkToken = async (_req: Request, res: Response) => {
  try {
    const configs = {
      user: {
        client_user_id: 'user-id',
      },
      client_name: 'Plaid Test App',
      products: PLAID_PRODUCTS,
      country_codes: PLAID_COUNTRY_CODES as CountryCode[],
      language: 'en',
    };

    if (PLAID_REDIRECT_URI !== '') {
      console.log('Redirect URI: ' + PLAID_REDIRECT_URI);
    }

    const createTokenResponse = await client.linkTokenCreate(configs);
    return res.json(createTokenResponse.data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

export const setAccessToken = async (req: Request, res: Response) => {
  try {
    const { public_token: PUBLIC_TOKEN } = req.body as { public_token: string };
    if (!PUBLIC_TOKEN) {
      return res.status(400).json({ error: 'Missing public token' });
    }
    const tokenResponse = await client.itemPublicTokenExchange({
      public_token: PUBLIC_TOKEN,
    });
    ACCESS_TOKEN = tokenResponse.data.access_token;
    if (!ACCESS_TOKEN) {
      console.log('Missing access token in: setAccessToken()');
      return res.status(500).json({ error: 'Could not set access token' });
    }
    ITEM_ID = tokenResponse.data.item_id;
    console.log('item ID: ' + ITEM_ID);
    if (PLAID_PRODUCTS.includes(Products.Transfer)) {
      TRANSFER_ID = tokenResponse.data.transfer_id;
      console.log('Transfer ID: ' + TRANSFER_ID);
    }
    const authUser = req.session?.user;

    const [user] = await sqlQuery.select('users', {
      id: authUser?.user_id,
      username: authUser?.username,
    });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await sqlQuery.update<UserType>(
      'users',
      {
        ...user,
        access_token: ACCESS_TOKEN,
      },
      {
        id: user.id,
      }
    );

    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
  const endDate = moment().format('YYYY-MM-DD');
  const authUser = req.session?.user;

  const [user] = await sqlQuery.select('users', {
    id: authUser?.user_id,
    username: authUser?.username,
  });

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { access_token: ACCESS_TOKEN } = user;

  if (!ACCESS_TOKEN) {
    return res.status(400).json({ error: 'Missing access token' });
  }
  const config = {
    access_token: ACCESS_TOKEN,
    start_date: startDate,
    end_date: endDate,
    options: {
      count: 250,
      offset: 0,
    },
  };
  try {
    const transactionsResponse = await client.transactionsGet(config);
    return res.json(transactionsResponse.data);
  } catch (error) {
    console.log('getTransactions() catch error: ' + error);
    return res.status(500).json({ error: error.message });
  }
};
