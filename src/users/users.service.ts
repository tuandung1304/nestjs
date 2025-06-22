import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      await this.prisma.user.create({
        data: createUserDto,
      });
    } catch {
      throw new BadRequestException('Email already exists');
    }
  }
}
