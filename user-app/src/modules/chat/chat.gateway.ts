import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisPubSub, ChatMessage, ConnectionUpdate } from 'shared-lib';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private redisPubSub = new RedisPubSub();

    async onModuleDestroy() {
        console.log('Cleaning up active user connections...');
        await this.redisPubSub.redisClient.del('activeConnections:users'); // Clear user connections
    }

    async onModuleInit() {
        console.log('Clearing stale connections...');
        await this.redisPubSub.redisClient.del('activeConnections:admins');
        await this.redisPubSub.redisClient.del('activeConnections:users');
    }

    afterInit() {
        console.log('User ChatGateway initialized');
        this.server.on('connection', (socket) => {
            console.log('User socket connected:', socket.id);
            socket.on('message', (data) => {
                console.log('Message received by User Gateway socket:', data);
            });
        });

        this.redisPubSub.subscribe('connections', (update: string) => {
            try {
                const parsedUpdate: ConnectionUpdate = JSON.parse(update);
                console.log(`Connection update received in User Gateway: ${JSON.stringify(parsedUpdate)}`);
                this.server.emit('activeConnections', parsedUpdate);
            } catch (error) {
                console.error('Failed to parse connection update:', error, update);
            }
        });

        this.redisPubSub.subscribe('chat', async (message: string) => {
            try {
                const chatMessage: ChatMessage = JSON.parse(message);
                console.log(`Chat message received in User Gateway: ${JSON.stringify(chatMessage)}`);

                const recipientSocketId = await this.redisPubSub.redisClient.hGet(
                    chatMessage.recipientId.startsWith('admin') ? 'activeConnections:admins' : 'activeConnections:users',
                    chatMessage.recipientId,
                );

                if (recipientSocketId) {
                    this.server.to(recipientSocketId).emit('message', chatMessage);
                    console.log(`Message forwarded to recipient in User Gateway: ${chatMessage.recipientId}`);
                } else {
                    console.error(`Recipient not connected in User Gateway: ${chatMessage.recipientId}`);
                }
            } catch (error) {
                console.error('Failed to process chat message in User Gateway:', error);
            }
        });
    }

    async handleConnection(client: Socket) {
        const userId = client.handshake.query.userId as string;

        if (!userId || typeof userId !== 'string') {
            console.error('Invalid or missing userId:', userId);
            client.disconnect();
            return;
        }

        console.log(`User connected: ${userId}`);

        await this.redisPubSub.redisClient.hSet('activeConnections:users', userId, client.id);

        const update: ConnectionUpdate = { type: 'connect', id: userId, role: 'user' };
        await this.redisPubSub.publish('connections', JSON.stringify(update));
    }

    async handleDisconnect(client: Socket) {
        const connections = await this.redisPubSub.redisClient.hGetAll('activeConnections:users');
        const userId = Object.entries(connections).find(([_, socketId]) => socketId === client.id)?.[0];

        if (userId) {
            console.log(`User disconnected: ${userId}`);
            await this.redisPubSub.redisClient.hDel('activeConnections:users', userId);

            const update: ConnectionUpdate = { type: 'disconnect', id: userId, role: 'user' };
            await this.redisPubSub.publish('connections', JSON.stringify(update));
        }
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(@MessageBody() message: ChatMessage, @ConnectedSocket() client: Socket) {
        console.log(`Message received in User Gateway from ${message.senderId} to ${message.recipientId}`);

        const recipientSocketId = await this.redisPubSub.redisClient.hGet(
            message.recipientId.startsWith('admin') ? 'activeConnections:admins' : 'activeConnections:users',
            message.recipientId,
        );
        console.log(`Recipient socket ID in User Gateway: ${recipientSocketId}`);

        if (recipientSocketId) {
            this.server.to(recipientSocketId).emit('message', message);
            console.log(`Message emitted in User Gateway to: ${recipientSocketId}`);
        } else {
            console.error('Recipient not connected in User Gateway');
            client.emit('error', { message: 'Recipient not connected' });
        }
    }
}
