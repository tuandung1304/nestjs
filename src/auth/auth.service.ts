import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, genSalt, hash } from 'bcrypt';
import { pick } from 'lodash';
import { UsersService } from 'src/users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signUpDto: SignUpDto) {
    const salt = await genSalt();
    const hashedPassword = await hash(signUpDto.password, salt);

    return this.usersService.create({
      ...signUpDto,
      password: hashedPassword,
    });
  }

  async signin(signInDto: SignInDto) {
    const user = await this.usersService.findByEmail(signInDto.email);
    if (!user) {
      throw new UnauthorizedException('Email is incorrect');
    }
    const passwordMatch = await compare(signInDto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Password is incorrect');
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };
    const token = await this.jwtService.signAsync(payload);

    return {
      accessToken: token,
      user: pick(user, ['id', 'email', 'name', 'avatarUrl']),
    };
  }
}
