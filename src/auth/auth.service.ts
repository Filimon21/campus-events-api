import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';

import { UsersService } from '../users/users.service.js';
import { User } from '../users/interfaces/user.interface.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(email: string, password: string) {
    const user = await this.usersService.create(email, password);

    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
    };
  }

  async login(email: string, password: string) {
    const user = this.usersService.findByEmail(email);

    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateTokens(user);
  }

  private async generateTokens(user: User) {
    const accessPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    const refreshPayload = {
      sub: user.id,
    };

    const accessToken = await this.jwtService.signAsync(accessPayload);

    const refreshToken = await this.jwtService.signAsync(
      refreshPayload,
      {
        secret: this.configService.getOrThrow<string>(
          'JWT_REFRESH_SECRET',
        ),
        expiresIn: '7d',
        keyid: randomUUID(),
      },
    );

    const refreshHash = await argon2.hash(refreshToken);

    this.usersService.updateRefreshHash(user.id, refreshHash);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
      }>(refreshToken, {
        secret: this.configService.getOrThrow<string>(
          'JWT_REFRESH_SECRET',
        ),
      });

      const user = this.usersService.findById(payload.sub);

      if (!user || !user.refreshHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isValid = await argon2.verify(
        user.refreshHash,
        refreshToken,
      );

      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  logout(userId: string) {
    this.usersService.clearRefreshHash(userId);

    return {
      message: 'Logged out successfully',
    };
  }
}