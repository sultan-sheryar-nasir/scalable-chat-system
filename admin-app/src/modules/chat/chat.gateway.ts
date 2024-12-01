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

    async onModuleInit() {
        console.log('Clearing stale connections...');
        await this.redisPubSub.redisClient.del('activeConnections:admins');
        await this.redisPubSub.redisClient.del('activeConnections:users');
    }

    async onModuleDestroy() {
        console.log('Cleaning up active admin connections...');
        await this.redisPubSub.redisClient.del('activeConnections:admins'); // Clear admin connections
    }

    afterInit() {
        console.log('Admin ChatGateway initialized');
        this.server.on('connection', (socket) => {
            console.log('Admin socket connected:', socket.id);
            socket.on('message', (data) => {
                console.log('Message received by Admin Gateway socket:', data);
            });
        });

        this.redisPubSub.subscribe('connections', (update: string) => {
            try {
                const parsedUpdate: ConnectionUpdate = JSON.parse(update);
                console.log(`Connection update received in Admin Gateway: ${JSON.stringify(parsedUpdate)}`);
                this.server.emit('activeConnections', parsedUpdate);
            } catch (error) {
                console.error('Failed to parse connection update:', error, update);
            }
        });

        this.redisPubSub.subscribe('chat', async (message: string) => {
            try {
                const chatMessage: ChatMessage = JSON.parse(message);
                console.log(`Chat message received in Admin Gateway: ${JSON.stringify(chatMessage)}`);

                const recipientSocketId = await this.redisPubSub.redisClient.hGet(
                    chatMessage.recipientId.startsWith('admin') ? 'activeConnections:admins' : 'activeConnections:users',
                    chatMessage.recipientId,
                );

                if (recipientSocketId) {
                    this.server.to(recipientSocketId).emit('message', chatMessage);
                    console.log(`Message forwarded to recipient in Admin Gateway: ${chatMessage.recipientId}`);
                } else {
                    console.error(`Recipient not connected in Admin Gateway: ${chatMessage.recipientId}`);
                }
            } catch (error) {
                console.error('Failed to process chat message in Admin Gateway:', error);
            }
        });
    }

    async handleConnection(client: Socket) {
        const adminId = client.handshake.query.adminId as string;

        if (!adminId || typeof adminId !== 'string') {
            console.error('Invalid or missing adminId:', adminId);
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
    async handleMessage(@MessageBody() message: any, @ConnectedSocket() client: Socket) {
        console.log(`Message received in Admin Gateway from ${message.senderId} to ${message.recipientId}`);

        const recipientSocketId = await this.redisPubSub.redisClient.hGet(
            message.recipientId.startsWith('admin') ? 'activeConnections:admins' : 'activeConnections:users',
            message.recipientId,
        );
        console.log(`Recipient socket ID in Admin Gateway: ${recipientSocketId}`);

        if (recipientSocketId) {
            this.server.to(recipientSocketId).emit('message', message);
            console.log(`Message emitted in Admin Gateway to: ${recipientSocketId}`);
        } else {
            console.error('Recipient not connected in Admin Gateway');
            client.emit('error', { message: 'Recipient not connected' });
        }
    }
}
