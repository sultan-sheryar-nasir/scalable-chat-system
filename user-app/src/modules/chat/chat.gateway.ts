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

    afterInit() {
        console.log('User ChatGateway initialized');
        this.redisPubSub.subscribe('chat', async (message: string) => {
            try {
                const chatMessage: ChatMessage = JSON.parse(message);
                console.log(`Chat message received in User Gateway: ${JSON.stringify(chatMessage)}`);

                const recipientSocketId = await this.redisPubSub.redisClient.hGet(
                    chatMessage.recipientId.startsWith('admin')
                        ? 'activeConnections:admins'
                        : 'activeConnections:users',
                    chatMessage.recipientId
                );

                if (recipientSocketId) {
                    this.server.to(recipientSocketId).emit('message', chatMessage);
                    console.log(`Message forwarded to recipient ${chatMessage.recipientId}`);
                } else {
                    console.error(`Recipient not connected: ${chatMessage.recipientId}`);
                }
            } catch (error) {
                console.error('Failed to process chat message:', error);
            }
        });
    }

    async handleConnection(client: Socket) {
        const userId = client.handshake.query.userId as string;

        if (!userId) {
            console.error('Invalid or missing userId');
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

        if (!message.recipientId) {
            console.error('Invalid recipientId in message:', message);
            return;
        }

        if (!message.recipientId.startsWith('admin')) {
            console.error('User cannot send messages to other users');
            client.emit('error', { message: 'You can only message admins' });
            return;
        }

        await this.redisPubSub.publish('chat', JSON.stringify(message));
    }
}
