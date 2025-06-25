import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, genSalt, hash } from 'bcrypt';
import { pick } from 'lodash';
import { UsersService } from 'src/users/users.service';
import { v4 as uuidv4 } from 'uuid';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  private readonly accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  private readonly refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

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
      username: user.name,
      email: user.email,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(payload, 'access'),
      this.generateToken(payload, 'refresh'),
    ]);

    return {
      accessToken,
      refreshToken,
      user: pick(user, ['id', 'email', 'name', 'avatarUrl']),
    };
  }

  private async generateToken(payload: Record<string, string>, type: 'access' | 'refresh') {
    const expiresIn = type === 'access' ? '15m' : '7d';
    const secret = type === 'access' ? this.accessTokenSecret : this.refreshTokenSecret;
    payload.jti = uuidv4();

    return await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
  }
}
