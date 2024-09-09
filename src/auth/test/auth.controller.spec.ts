import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../../modules/user/dtos/create-user.dto';
import { UserService } from '../../modules/user/services/user.service';
import { AuthController } from '../controllers/auth.controller';
import { LoginDto } from '../dtos/login.dto';
import { AuthService } from '../services/auth.service';

jest.mock('bcrypt');

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userService: UserService;

  const mockUserService = {
    create: jest.fn(),
  };

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);

    // Configuração do mock do bcrypt
    (bcrypt.hash as jest.Mock).mockImplementation(async (password: string) => {
      return `hashed_${password}`;
    });

    (bcrypt.compare as jest.Mock).mockImplementation(
      async (password: string, hash: string) => {
        return password === hash.replace('hashed_', '');
      }
    );
  });

  describe('login', () => {
    it('should return an access token if credentials are valid', async () => {
      const loginDto: LoginDto = {
        email: 'john.doe@example.com',
        password: 'password123',
      };
      const user = {
        id: 1,
        email: 'john.doe@example.com',
        password: 'hashed_password',
      };
      const accessToken = 'jwt_token';

      jest.spyOn(authService, 'validateUser').mockResolvedValue(user as any);
      jest
        .spyOn(authService, 'login')
        .mockResolvedValue({ access_token: accessToken });

      expect(await authController.login(loginDto)).toEqual({
        access_token: accessToken,
      });
    });

    it('should throw an UnauthorizedException if credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'john.doe@example.com',
        password: 'wrongpassword',
      };

      jest
        .spyOn(authService, 'validateUser')
        .mockRejectedValue(new UnauthorizedException());

      await expect(authController.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('register', () => {
    it('should create a user and return an access token', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        amount: 1000,
      };
      const user = { id: 1, ...createUserDto, password: 'hashed_password' };
      const accessToken = 'jwt_token';

      jest.spyOn(userService, 'create').mockResolvedValue(user as any);
      jest
        .spyOn(authService, 'login')
        .mockResolvedValue({ access_token: accessToken });

      const result = await authController.register(createUserDto);
      expect(result).toEqual({ access_token: accessToken });
    });
  });
});
