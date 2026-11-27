import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';

import { User } from './interfaces/user.interface.js';

@Injectable()
export class UsersService {
  private users: User[] = [];

  // Register a new user
  async create(email: string, password: string): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = this.users.find(
      (user) => user.email === normalizedEmail,
    );

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await argon2.hash(password);

    const newUser: User = {
      id: randomUUID(),
      email: normalizedEmail,
      passwordHash,
      roles: ['user'],
      refreshHash: null,
    };

    this.users.push(newUser);

    return newUser;
  }

  // Find a user by email
  findByEmail(email: string): User | undefined {
    const normalizedEmail = email.trim().toLowerCase();

    return this.users.find(
      (user) => user.email === normalizedEmail,
    );
  }

  // Find a user by ID
  findById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  // Save a hashed refresh token
  updateRefreshHash(id: string, refreshHash: string): void {
    const user = this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.refreshHash = refreshHash;
  }

  // Remove the stored refresh token
  clearRefreshHash(id: string): void {
    const user = this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.refreshHash = null;
  }
}