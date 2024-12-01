import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from '../../src/modules/chat/chat.gateway';
import { Socket } from 'socket.io';

class MockRedisPubSub {
  subscribe = jest.fn();
  publish = jest.fn();
  redisClient = {
    hSet: jest.fn(),
    hGet: jest.fn(),
    hGetAll: jest.fn(),
    hDel: jest.fn(),
  };
}

describe('ChatGateway Unit Tests', () => {
  let gateway: ChatGateway;
  let mockRedisPubSub: MockRedisPubSub;
  let mockServer: Partial<Socket>;

  beforeEach(async () => {
    mockRedisPubSub = new MockRedisPubSub();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: 'RedisPubSub',
          useValue: mockRedisPubSub, // Injecting the mock RedisPubSub
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    mockServer = {
      emit: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as Socket;

    // Replace private redisPubSub with mockRedisPubSub
    (gateway as any).redisPubSub = mockRedisPubSub;
  });

  it('should initialize ChatGateway', () => {
    expect(gateway).toBeDefined();
    expect(gateway['redisPubSub']).toBeDefined();
  });

  it('should handle a connection', async () => {
    const client = {
      handshake: { query: { adminId: 'admin1' } },
      id: 'mockSocketId',
      disconnect: jest.fn(),
    } as unknown as Socket;

    await gateway.handleConnection(client);

    expect(mockRedisPubSub.redisClient.hSet).toHaveBeenCalledWith(
      'activeConnections:admins',
      'admin1',
      'mockSocketId',
    );
    expect(mockRedisPubSub.publish).toHaveBeenCalledWith(
      'connections',
      JSON.stringify({ type: 'connect', id: 'admin1', role: 'admin' }),
    );
  });

  it('should handle a disconnection', async () => {
    mockRedisPubSub.redisClient.hGetAll.mockResolvedValue({
      admin1: 'mockSocketId',
    });

    const client = {
      id: 'mockSocketId',
    } as unknown as Socket;

    await gateway.handleDisconnect(client);

    expect(mockRedisPubSub.redisClient.hDel).toHaveBeenCalledWith(
      'activeConnections:admins',
      'admin1',
    );
    expect(mockRedisPubSub.publish).toHaveBeenCalledWith(
      'connections',
      JSON.stringify({ type: 'disconnect', id: 'admin1', role: 'admin' }),
    );
  });

  it('should handle a message', async () => {
    mockRedisPubSub.redisClient.hGet.mockResolvedValue('mockRecipientSocketId');

    const message = {
      senderId: 'admin1',
      recipientId: 'user1',
      content: 'Hello, User!',
      timestamp: new Date(),
    };

    await gateway.handleMessage(message, mockServer as Socket);

    expect(mockRedisPubSub.publish).toHaveBeenCalledWith(
      'chat',
      JSON.stringify(message),
    );
  });

  it('should emit error if recipient is not connected', async () => {
    mockRedisPubSub.redisClient.hGet.mockResolvedValue(null);

    const message = {
      senderId: 'admin1',
      recipientId: 'user1',
      content: 'Hello, User!',
      timestamp: new Date(),
    };

    await gateway.handleMessage(message, mockServer as Socket);

    expect(mockServer.emit).toHaveBeenCalledWith('error', {
      message: 'Recipient not connected',
    });
  });
});
