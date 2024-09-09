/* eslint-disable @typescript-eslint/no-unused-vars */
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  let bcryptHash: jest.Mock;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    bcryptHash = bcrypt.hash as jest.Mock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        amount: 10000,
        password: 'password123',
      };

      const hashedPassword = 'hashedpassword';
      const createdUser: User = {
        id: 1,
        ...createUserDto,
        password: hashedPassword,
        investments: [],
      };

      bcryptHash.mockResolvedValue(hashedPassword);

      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);

      const result = await userService.create(createUserDto);
      expect(result).toEqual(createdUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(createdUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: User[] = [
        {
          id: 1,
          name: 'User One',
          email: 'one@example.com',
          amount: 5000,
          password: 'hashedpassword',
          investments: [],
        },
        {
          id: 2,
          name: 'User Two',
          email: 'two@example.com',
          amount: 1000,
          password: 'hashedpassword',
          investments: [],
        },
      ];

      mockUserRepository.find.mockResolvedValue(users);

      const result = await userService.findAll();
      expect(result).toEqual(users);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const user: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        amount: 10000,
        password: 'hashedpassword',
        investments: [],
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await userService.findOne(1);
      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw a NotFoundException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(userService.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and save a user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated User',
        email: 'updated@example.com',
        amount: 8000,
        password: 'newpassword123',
      };

      const existingUser: User = {
        id: 1,
        name: 'Old User',
        email: 'old@example.com',
        amount: 5000,
        password: 'hashedpassword',
        investments: [],
      };

      const updatedUser: User = {
        id: 1,
        name: updateUserDto.name,
        email: updateUserDto.email,
        amount: updateUserDto.amount,
        password: 'newhashedpassword',
        investments: [],
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      bcryptHash.mockResolvedValue('newhashedpassword');

      const result = await userService.update(1, updateUserDto);
      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...existingUser,
        ...updateUserDto,
        password: 'newhashedpassword',
      });
    });

    it('should throw a NotFoundException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(userService.update(1, {} as UpdateUserDto)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('delete', () => {
    it('should delete a user by ID', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      await userService.delete(1);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw a NotFoundException if user is not found for deletion', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(userService.delete(1)).rejects.toThrow(NotFoundException);
    });
  });
});
