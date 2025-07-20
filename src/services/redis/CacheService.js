const redis = require('redis');

class CacheService {
  constructor() {
    this._cache = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER,
      },
    });

    this._cache.on('error', (error) => {
      console.error('Cache error', error);
    });

    this._cache.connect();
  }

  async set(key, value, options = { expirationInSeconds: 3600 }) {
    await this._cache.set(key, value, {
      expiration: {
        type: 'EX',
        value: options.expirationInSeconds,
      },
    });
  }

  async get(key) {
    const result = await this._cache.get(key);

    if (result === null) {
      throw new Error('Cache not found');
    }

    return result;
  }

  async getOrCreate(key, factory, options = {
    expirationInSeconds: 3600,
  }) {
    let result;
    let fromCache = false;

    try {
      result = await this.get(key);
      fromCache = true;
    } catch (error) {
      result = await factory();
      await this.set(key, result, options);
    }

    return { result, fromCache };
  }

  async delete(key) {
    return this._cache.del(key);
  }
}

module.exports = { CacheService };
