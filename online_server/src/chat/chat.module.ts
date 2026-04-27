import { Module } from '@nestjs/common';

import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
