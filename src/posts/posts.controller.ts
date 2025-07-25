import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { GetPostsDto } from './dto/getPosts.dto';
import { PostsCachingInterceptor } from './posts.interceptor';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @UseInterceptors(PostsCachingInterceptor)
  getPosts(@Query() getPostsDto: GetPostsDto) {
    return this.postsService.getPosts(getPostsDto);
  }
}
