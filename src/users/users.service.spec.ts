import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';

import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a user with a hashed password', async () => {
    const user = await service.create(
      'filimon@example.com',
      'TestPass123!',
    );

    expect(user.email).toBe('filimon@example.com');
    expect(user.passwordHash).not.toBe('TestPass123!');
    expect(
      await argon2.verify(user.passwordHash, 'TestPass123!'),
    ).toBe(true);
  });

  it('should assign the default user role', async () => {
    const user = await service.create(
      'filimon@example.com',
      'TestPass123!',
    );

    expect(user.roles).toEqual(['user']);
  });

  it('should reject duplicate email addresses', async () => {
    await service.create(
      'filimon@example.com',
      'TestPass123!',
    );

    await expect(
      service.create(
        'filimon@example.com',
        'AnotherPass123!',
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('should normalize email addresses', async () => {
    const user = await service.create(
      ' FILIMON@EXAMPLE.COM ',
      'TestPass123!',
    );

    expect(user.email).toBe('filimon@example.com');
    expect(service.findByEmail('FILIMON@EXAMPLE.COM')).toEqual(user);
  });

  it('should store and clear a refresh token hash', async () => {
    const user = await service.create(
      'filimon@example.com',
      'TestPass123!',
    );

    service.updateRefreshHash(user.id, 'hashed-refresh-token');

    expect(service.findById(user.id)?.refreshHash).toBe(
      'hashed-refresh-token',
    );

    service.clearRefreshHash(user.id);

    expect(service.findById(user.id)?.refreshHash).toBeNull();
  });
});