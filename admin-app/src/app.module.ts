import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './modules/posts/posts.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [PostsModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
