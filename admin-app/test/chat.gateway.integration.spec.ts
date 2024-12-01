import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from '../../src/modules/chat/chat.gateway';
import { Server } from 'socket.io';

describe('ChatGateway Integration Tests', () => {
  let gateway: ChatGateway;
  let mockServer: Partial<Server>;

  beforeEach(async () => {
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: 'Server',
          useValue: mockServer,
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
  });

  it('should forward chat message to the correct recipient', async () => {
    const message = {
      senderId: 'admin1',
      recipientId: 'user1',
      content: 'Hello!',
      timestamp: new Date(),
    };

    const mockClient = {
      id: 'mockClientId',
      handshake: { query: { adminId: 'admin1' } },
      emit: jest.fn(),
    };

    await gateway.handleMessage(message, mockClient as any);

    expect(mockServer.emit).toHaveBeenCalledWith('message', message);
  });
});
