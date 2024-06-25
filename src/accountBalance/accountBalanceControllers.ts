import { sqlQuery } from '../lib/querySql';
import { Request, Response } from 'express';
import { AccountBalance } from './accountBalanceType';
export const getAccountBalances = async (req: Request, res: Response) => {
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
    return res.status(400).json({ error: 'No account was linked.' });
  }

  try {
    const [accountBalances] = await sqlQuery.query<AccountBalance>(
      'call getPivotedBalances(?)',
      [authUser?.user_id]
    );

    // return res.json(accountBalances);

    /*
      return the account balances in the following format:
      [{
        date: '2021-01-01',
        [official_name]: [balance],
        ...
      }, 
      {
        date: '2021-01-02',
        [official_name]: [balance],
        ...
      }]
    */

    // const accountBalancesByDate = accountBalances.map((accountBalance) => {
    //   const { date, official_name, balance } = accountBalance;
    //   return {
    //     date,
    //     [official_name]: balance,
    //   };
    // });

    return res.json(accountBalances);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
