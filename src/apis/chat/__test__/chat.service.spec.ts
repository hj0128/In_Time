import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Chat } from '../chat.entity';
import { ChatService } from '../chat.service';
import { ChatGetHistory, ChatSaveMessageDto } from '../chat.dto';
import { Party } from 'src/apis/party/party.entity';

describe('PartyService', () => {
  let chatService: ChatService;
  let mockChatRepository: Partial<Record<keyof Repository<Chat>, jest.Mock>>;

  beforeEach(async () => {
    mockChatRepository = {
      save: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getRepositoryToken(Chat), useValue: mockChatRepository }, //
      ],
    }).compile();

    chatService = module.get<ChatService>(ChatService);
  });

  const mockParty: Party = {
    id: 'Party01',
    name: '파티명',
    point: 0,
    deletedAt: null,
    chats: [],
    markers: [],
    partyPoints: [],
    partyUsers: [],
    plans: [],
  };
  const mockChat: Chat = {
    id: 'Chat01',
    room: 'Party01',
    message: 'hello',
    userName: '철수',
    timestamp: new Date(),
    deletedAt: null,
    party: mockParty,
  };

  describe('saveMessage', () => {
    it('메시지를 데이터베이스에 저장한 후 저장된 Chat을 반환한다.', async () => {
      const inputChatSaveMessageDto: ChatSaveMessageDto = {
        partyID: 'Party01',
        message: 'hello',
        room: 'Party01',
        userName: '철수',
      };

      const expectedChat: Chat = mockChat;

      jest.spyOn(mockChatRepository, 'save').mockResolvedValue(expectedChat);

      const result: Chat = await chatService.saveMessage({
        chatSaveMessageDto: inputChatSaveMessageDto,
      });

      expect(result).toEqual(expectedChat);
      expect(mockChatRepository.save).toHaveBeenCalledWith({
        userName: inputChatSaveMessageDto.userName,
        message: inputChatSaveMessageDto.message,
        room: inputChatSaveMessageDto.room,
        party: { id: mockParty.id },
      });
    });
  });

  describe('getHistory', () => {
    it('해당 party의 데이터베이스에 저장된 Chat 배열을 반환한다.', async () => {
      const inputChatGetHistory: ChatGetHistory = { room: 'Party01' };

      const expectedChat: Chat[] = [];

      jest.spyOn(mockChatRepository, 'find').mockResolvedValue(expectedChat);

      const result: Chat[] = await chatService.getHistory({
        chatGetHistory: inputChatGetHistory,
      });

      expect(result).toEqual(expectedChat);
      expect(mockChatRepository.find).toHaveBeenCalledWith({
        where: { room: inputChatGetHistory.room },
        order: { timestamp: 'ASC' },
      });
    });
  });
});
