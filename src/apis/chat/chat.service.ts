import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Chat } from './chat.entity';
import {
  IChatServiceChatSaveMessageDto,
  IChatServiceDelete,
  IChatServiceGetHistory,
  IChatServiceRestore,
} from './chat.interface';

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

  async delete({ chatDelete }: IChatServiceDelete): Promise<UpdateResult> {
    try {
      const { partyID, queryRunner } = chatDelete;

      const result = await queryRunner.manager.softDelete(Chat, { party: { id: partyID } });

      return result;
    } catch (error) {
      throw new InternalServerErrorException('채팅 삭제에 실패하였습니다.');
    }
  }

  async restore({ chatRestore }: IChatServiceRestore) {
    try {
      const { partyID, queryRunner } = chatRestore;

      const result = await queryRunner.manager.restore(Chat, {
        party: { id: partyID },
      });

      return result.affected ? true : false;
    } catch (error) {
      throw new InternalServerErrorException('채팅 복구에 실패하였습니다.');
    }
  }
}
