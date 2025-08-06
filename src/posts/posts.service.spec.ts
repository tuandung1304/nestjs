import { PrismaService } from '../prisma/prisma.service';
import { GetPostsDto } from './dto/getPosts.dto';
import { PostsService } from './posts.service';
import { Test } from '@nestjs/testing';

describe('PostsService', () => {
  let service: PostsService;

  const mockPrisma = {
    post: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PostsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get(PostsService);

    jest.clearAllMocks();
  });

  it('should fetch posts without cursor', async () => {
    const dto: GetPostsDto = { limit: 10, page: 2 };

    mockPrisma.post.findMany.mockResolvedValue([
      { id: 1, title: 'Post 1' },
      { id: 2, title: 'Post 2' },
      { id: 3, title: 'Post 3' },
    ]);
    mockPrisma.post.count.mockResolvedValue(13);

    const result = await service.getPosts(dto);

    expect(mockPrisma.post.findMany).toHaveBeenCalledWith({
      where: {},
      take: 10,
      skip: 10,
      orderBy: { id: 'desc' },
    });

    expect(result).toEqual({
      posts: [
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' },
        { id: 3, title: 'Post 3' },
      ],
      pagination: {
        total: 13,
        page: 2,
        limit: 10,
        totalPages: 2,
        hasNextPage: false,
        nextCursor: null,
      },
    });
  });
});
