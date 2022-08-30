import { createClient } from 'redis';
import { createError } from 'package-middlewares';

export class RedisService {
  private client = createClient();

  constructor() {
    this.client.on('error', (err) => {
      console.log(err);
      throw createError('Failed to connect to redis', 500);
    });

    this.client.connect();
  }

  public async setKey(key: string, value: string) {
    await this.client.set(key, value).catch((e) => {
      throw e;
    });
    return [key, value];
  }

  public async deleteKey(key: string) {
    const n = await this.client.del(key).catch((e) => {
      throw e;
    });
    return n;
  }

  public async getValue(key: string) {
    const value = this.client.get(key).catch((e) => {
      throw e;
    });

    return value;
  }
}

const redis = new RedisService();

export default redis;
