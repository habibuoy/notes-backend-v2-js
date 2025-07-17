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

  async get(key, value) {
    const result = await this._cache.set(key, value);

    if (result === null) {
      throw new Error('Cache not found');
    }

    return result;
  }

  async delete(key) {
    return this._cache.del(key);
  }
}

module.exports = { CacheService };
