import { ChatGetHistory, ChatSaveMessageDto } from './chat.dto';

export interface IChatServiceChatSaveMessageDto {
  chatSaveMessageDto: ChatSaveMessageDto;
}

export interface IChatServiceGetHistory {
  chatGetHistory: ChatGetHistory;
}
