import { Module } from '@nestjs/common';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [ChatModule], // Add ChatModule
})
export class AppModule {}
