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
        console.log('Admin ChatGateway initialized');
        this.redisPubSub.subscribe('chat', async (message: string) => {
            try {
                const chatMessage: ChatMessage = JSON.parse(message);
                console.log(`Chat message received in Admin Gateway: ${JSON.stringify(chatMessage)}`);

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
        const adminId = client.handshake.query.adminId as string;

        if (!adminId) {
            console.error('Invalid or missing adminId');
            client.disconnect();
            return;
        }

        console.log(`Admin connected: ${adminId}`);
        await this.redisPubSub.redisClient.hSet('activeConnections:admins', adminId, client.id);

        const update: ConnectionUpdate = { type: 'connect', id: adminId, role: 'admin' };
        await this.redisPubSub.publish('connections', JSON.stringify(update));
    }

    async handleDisconnect(client: Socket) {
        const connections = await this.redisPubSub.redisClient.hGetAll('activeConnections:admins');
        const adminId = Object.entries(connections).find(([_, socketId]) => socketId === client.id)?.[0];

        if (adminId) {
            console.log(`Admin disconnected: ${adminId}`);
            await this.redisPubSub.redisClient.hDel('activeConnections:admins', adminId);

            const update: ConnectionUpdate = { type: 'disconnect', id: adminId, role: 'admin' };
            await this.redisPubSub.publish('connections', JSON.stringify(update));
        }
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(@MessageBody() message: ChatMessage, @ConnectedSocket() client: Socket) {
        console.log(`Message received in Admin Gateway from ${message.senderId} to ${message.recipientId}`);

        if (!message.recipientId) {
            console.error('Invalid recipientId in message:', message);
            return;
        }

        await this.redisPubSub.publish('chat', JSON.stringify(message));
    }
}
