import { Controller, Get, Post, Put, Delete, Body, Param, Sse } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Observable, Subject, interval, merge, map } from 'rxjs';

@Controller('posts')
export class PostsController {
    private postUpdates$ = new Subject<any>(); // Subject for post updates

    constructor(private readonly postsService: PostsService) { }

    @Post()
    create(@Body() createPostDto: any) {
        const newPost = this.postsService.create(createPostDto);
        this.triggerUpdate({ event: 'postCreated', data: newPost });
        return newPost;
    }

    @Sse('updates')
    sendUpdates(): Observable<any> {
        // Emit periodic keep-alive messages
        const keepAlive$ = interval(5000).pipe(
            map(() => ({
                event: 'keepAlive',
                data: { timestamp: new Date().toISOString() },
            }))
        );

        // Stream post updates
        const postUpdates$ = this.postUpdates$.pipe(
            map((update) => ({
                event: update.event,
                data: update.data,
            }))
        );

        // Combine keep-alive and post updates into a single stream
        return merge(keepAlive$, postUpdates$);
    }

    @Get()
    findAll() {
        return this.postsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.postsService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() updatePostDto: any) {
        const updatedPost = this.postsService.update(id, updatePostDto);
        this.triggerUpdate({ event: 'postUpdated', data: updatedPost });
        return updatedPost;
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        const deletedPost = this.postsService.remove(id);
        this.triggerUpdate({ event: 'postDeleted', data: deletedPost });
        return deletedPost;
    }




    private triggerUpdate(update: { event: string; data: any }) {
        this.postUpdates$.next(update);
    }
}
