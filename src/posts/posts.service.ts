import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetPostsDto } from './dto/getPosts.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPosts(getPostsDto: GetPostsDto) {
    const { page, limit, cursor } = getPostsDto;
    const skip = (page - 1) * limit;

    const where = cursor
      ? {
          id: {
            lt: parseInt(cursor),
          },
        }
      : {};

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        take: limit,
        skip: cursor ? 0 : skip,
        orderBy: {
          id: 'desc',
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    const hasNextPage = posts.length === limit;
    const nextCursor = hasNextPage ? posts[posts.length - 1]?.id.toString() : null;

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage,
        nextCursor,
      },
    };
  }
}
