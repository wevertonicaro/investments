/* eslint-disable @typescript-eslint/no-unused-vars */
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/user/entities/user.entity';
import { UserService } from '../../modules/user/services/user.service';
import { AuthService } from '../services/auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const hashedPassword = 'hashed_password';

  const mockUserService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return a user if credentials are valid', async () => {
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        amount: 1000,
        investments: [],
      };

      (userService.findByEmail as jest.Mock).mockResolvedValue(user);

      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(async (password: string, hash: string) => {
          return password === 'password123' && hash === hashedPassword;
        });

      const result = await authService.validateUser(
        'john.doe@example.com',
        'password123'
      );
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.validateUser('john.doe@example.com', 'wrongpassword')
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        amount: 1000,
        investments: [],
      };

      const payload = { email: user.email, sub: user.id };
      const accessToken = 'jwt_token';

      jest.spyOn(jwtService, 'sign').mockReturnValue(accessToken);

      await expect(authService.login(user)).resolves.toEqual({
        access_token: accessToken,
      });
    });
  });
});
