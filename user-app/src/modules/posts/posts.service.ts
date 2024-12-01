import { Injectable } from '@nestjs/common';
import { Post } from 'shared-lib';

@Injectable()
export class PostsService {
  private posts: Post[] = [];

  fetchPosts(): Post[] {
    return this.posts; // Simulated fetch; integrate with REST API later
  }
}
