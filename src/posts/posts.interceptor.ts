import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { map, Observable, of } from 'rxjs';
import { RedisService } from 'src/redis/redis.service';
import { PostsService } from './posts.service';

type T = Awaited<ReturnType<PostsService['getPosts']>>;

@Injectable()
export class PostsCachingInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler<T>): Promise<Observable<T> | Observable<Promise<T>>> {
    const request = context.switchToHttp().getRequest<Request>();
    const { page, limit } = request.query as { page: string; limit: string };
    const cacheKey = `posts:${page}:${limit}`;

    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) return of(JSON.parse(cachedData));

    return next.handle().pipe(
      map(async (data) => {
        await this.redisService.set(cacheKey, JSON.stringify(data));
        return data;
      }),
    );
  }
}
