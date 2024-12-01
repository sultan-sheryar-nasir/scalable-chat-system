import { RedisClientType, createClient } from 'redis';

export class RedisPubSub {
    private publisher: RedisClientType;
    private subscriber: RedisClientType;

    constructor() {
        const redisHost = process.env.REDIS_HOST || '127.0.0.1';
        const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

        this.publisher = createClient({ url: `redis://${redisHost}:${redisPort}` });
        this.subscriber = createClient({ url: `redis://${redisHost}:${redisPort}` });

        this.subscriber.connect();
        this.publisher.connect();
    }

    async publish(channel: string, message: string) {
        await this.publisher.publish(channel, message);
    }

    subscribe(channel: string, callback: (message: string) => void) {
        this.subscriber.subscribe(channel, (message) => {
            callback(message);
        });
    }

    async close() {
        console.log('Closing Redis connections');
        await this.publisher.quit();
        await this.subscriber.quit();
      }
    
    get redisClient() {
        return this.publisher; // Use `publisher` since it’s already connected
    }
}
