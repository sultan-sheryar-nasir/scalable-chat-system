import { Injectable } from '@nestjs/common';
import { Post } from 'shared-lib';
import { SSEManager } from 'shared-lib';

@Injectable()
export class PostsService {
  private posts: Post[] = [];
  private sseManager = new SSEManager();

  getSseManager() {
    return this.sseManager; // Controlled access via getter
  }
  
  create(createPostDto: Omit<Post, 'id' | 'timestamp'>) {
    const newPost: Post = {
      id: Date.now(),
      ...createPostDto,
      timestamp: new Date(),
    };
    this.posts.push(newPost);
    this.sseManager.broadcast('postCreated', newPost);
    return newPost;
  }

  findAll(): Post[] {
    return this.posts;
  }

  findOne(id: number): Post | undefined {
    return this.posts.find((post) => post.id === id);
  }

  update(id: number, updatePostDto: Partial<Post>) {
    const postIndex = this.posts.findIndex((post) => post.id === id);
    if (postIndex > -1) {
      this.posts[postIndex] = { ...this.posts[postIndex], ...updatePostDto };
      this.sseManager.broadcast('postUpdated', this.posts[postIndex]);
      return this.posts[postIndex];
    }
    return null;
  }

  remove(id: number) {
    const postIndex = this.posts.findIndex((post) => post.id === id);
    if (postIndex > -1) {
      const removedPost = this.posts.splice(postIndex, 1)[0];
      this.sseManager.broadcast('postDeleted', removedPost);
      return removedPost;
    }
    return null;
  }
}
