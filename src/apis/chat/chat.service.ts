import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './chat.entity';
import { IChatServiceChatSaveMessageDto, IChatServiceGetHistory } from './chat.interface';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  async saveMessage({ chatSaveMessageDto }: IChatServiceChatSaveMessageDto): Promise<Chat> {
    const { userName, message, room, partyID } = chatSaveMessageDto;

    return this.chatRepository.save({ userName, message, room, party: { id: partyID } });
  }

  async getHistory({ chatGetHistory }: IChatServiceGetHistory): Promise<Chat[]> {
    const { room } = chatGetHistory;

    return this.chatRepository.find({
      where: { room },
      order: { timestamp: 'ASC' },
    });
  }
}
