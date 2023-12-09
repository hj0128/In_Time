import { ChatDelete, ChatGetHistory, ChatRestore, ChatSaveMessageDto } from './chat.dto';

export interface IChatServiceChatSaveMessageDto {
  chatSaveMessageDto: ChatSaveMessageDto;
}

export interface IChatServiceGetHistory {
  chatGetHistory: ChatGetHistory;
}

export interface IChatServiceDelete {
  chatDelete: ChatDelete;
}

export interface IChatServiceRestore {
  chatRestore: ChatRestore;
}
