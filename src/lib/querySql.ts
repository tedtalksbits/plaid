import { UserType } from 'src/user/userType';
import db from './mysql';

export const sqlQuery = {
  async query<T extends Record<string, any>>(query: string, values: any[]) {
    const [result] = await db.execute(query, values);
    return result as T[] | any[];
  },
  async save<T extends Record<string, any>>(tableName: string, data: T) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const [result] = await db.execute(
      `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${keys
        .map(() => '?')
        .join(', ')})`,
      values
    );
    return result as any[];
  },

  async select<T extends Record<string, any>>(tableName: string, where: T) {
    const keys = Object.keys(where);
    const values = Object.values(where);

    const [result] = await db.execute(
      `SELECT * FROM ${tableName} WHERE ${keys.join(' = ? AND ')} = ?`,
      values
    );
    return result as any[];
  },

  async selectAll(tableName: string) {
    const [result] = await db.execute(`SELECT * FROM ${tableName}`);
    return result as any[];
  },

  async update<T extends Record<string, any>>(
    tableName: string,
    data: Partial<T>,
    where: Partial<T>
  ) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);

    const [result] = await db.execute(
      `UPDATE ${tableName} SET ${keys
        .map((key) => `${key} = ?`)
        .join(', ')} WHERE ${whereKeys
        .map((key) => `${key} = ?`)
        .join(' AND ')}`,
      [...values, ...whereValues]
    );
    return result as any[];
  },

  async delete(tableName: string, where: any) {
    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);

    const [result] = await db.execute(
      `DELETE FROM ${tableName} WHERE ${whereKeys
        .map((key) => `${key} = ?`)
        .join(' AND ')}`,
      whereValues
    );
    return result as any[];
  },

  setUndefineToNull<T extends Record<string, any>>(data: T) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const newData: any = {};
    for (let i = 0; i < values.length; i++) {
      if (values[i] === undefined) {
        newData[keys[i]] = null;
      } else {
        newData[keys[i]] = values[i];
      }
    }
    return newData;
  },
};
