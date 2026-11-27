import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { vi } from 'vitest';

import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let passwordHash: string;

  const mockUser = {
    id: 'user-123',
    email: 'filimon@example.com',
    passwordHash: '',
    roles: ['user'],
    refreshHash: null as string | null,
  };

  const mockUsersService = {
    create: vi.fn(),
    findByEmail: vi.fn(),
    findById: vi.fn(),
    updateRefreshHash: vi.fn(),
    clearRefreshHash: vi.fn(),
  };

  const mockJwtService = {
    signAsync: vi.fn(),
    verifyAsync: vi.fn(),
  };

  const mockConfigService = {
    getOrThrow: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    passwordHash = await argon2.hash('TestPass123!');
    mockUser.passwordHash = passwordHash;
    mockUser.refreshHash = null;

    mockConfigService.getOrThrow.mockReturnValue('test-refresh-secret');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should login with correct credentials and issue tokens', async () => {
    mockUsersService.findByEmail.mockReturnValue(mockUser);

    mockJwtService.signAsync
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');

    const result = await service.login(
      'filimon@example.com',
      'TestPass123!',
    );

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(mockUsersService.updateRefreshHash).toHaveBeenCalled();

    const savedHash =
      mockUsersService.updateRefreshHash.mock.calls[0][1];

    expect(await argon2.verify(savedHash, 'new-refresh-token')).toBe(true);
  });

  it('should reject login with an incorrect password', async () => {
    mockUsersService.findByEmail.mockReturnValue(mockUser);

    await expect(
      service.login('filimon@example.com', 'WrongPass123!'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject login for an unknown email', async () => {
    mockUsersService.findByEmail.mockReturnValue(undefined);

    await expect(
      service.login('unknown@example.com', 'TestPass123!'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should refresh tokens using a valid refresh token', async () => {
    const oldRefreshToken = 'old-refresh-token';

    mockUser.refreshHash = await argon2.hash(oldRefreshToken);

    mockUsersService.findById.mockReturnValue(mockUser);

    mockJwtService.verifyAsync.mockResolvedValue({
      sub: mockUser.id,
    });

    mockJwtService.signAsync
      .mockResolvedValueOnce('rotated-access-token')
      .mockResolvedValueOnce('rotated-refresh-token');

    const result = await service.refresh(oldRefreshToken);

    expect(result.accessToken).toBe('rotated-access-token');
    expect(result.refreshToken).toBe('rotated-refresh-token');
    expect(mockUsersService.updateRefreshHash).toHaveBeenCalled();

    const savedHash =
      mockUsersService.updateRefreshHash.mock.calls[0][1];

    expect(
      await argon2.verify(savedHash, 'rotated-refresh-token'),
    ).toBe(true);
  });

  it('should reject an invalid refresh token', async () => {
    mockJwtService.verifyAsync.mockRejectedValue(
      new Error('Invalid token'),
    );

    await expect(
      service.refresh('invalid-refresh-token'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should clear the refresh hash during logout', () => {
    const result = service.logout(mockUser.id);

    expect(result.message).toBe('Logged out successfully');
    expect(mockUsersService.clearRefreshHash).toHaveBeenCalledWith(
      mockUser.id,
    );
  });
});