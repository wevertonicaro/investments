import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../controllers/user.controller';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';

describe('UserController', () => {
  let userController: UserController;

  const mockUserService = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        amount: 10000,
        password: 'password123',
      };
      const createdUser: User = { id: 1, ...createUserDto, investments: [] };

      mockUserService.create.mockResolvedValue(createdUser);

      const result = await userController.create(createUserDto);
      expect(result).toEqual(createdUser);
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = 1;
      const user: User = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        amount: 1000,
        password: 'password123',
        investments: [],
      };

      mockUserService.findOne.mockResolvedValue(user);

      const result = await userController.findOne(userId);
      expect(result).toEqual(user);
      expect(mockUserService.findOne).toHaveBeenCalledWith(userId);
    });

    it('should throw an error if user is not found', async () => {
      const userId = 1;

      mockUserService.findOne.mockRejectedValue(
        new NotFoundException(`User with ID ${userId} not found`)
      );

      await expect(userController.findOne(userId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        name: 'Updated User',
        email: 'updated@example.com',
        amount: 5000,
        password: 'newpassword123',
      };

      const updatedUser: User = {
        id: userId,
        name: updateUserDto.name,
        email: updateUserDto.email,
        amount: updateUserDto.amount,
        password: 'password123',
        investments: [],
      };

      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await userController.update(userId, updateUserDto);
      expect(result).toEqual(updatedUser);
      expect(mockUserService.update).toHaveBeenCalledWith(
        userId,
        updateUserDto
      );
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const userId = 1;
      mockUserService.delete.mockResolvedValue(undefined);

      await userController.remove(userId);
      expect(mockUserService.delete).toHaveBeenCalledWith(userId);
    });

    it('should throw an error if user is not found', async () => {
      const userId = 1;

      mockUserService.delete.mockRejectedValue(
        new NotFoundException(`User with ID ${userId} not found`)
      );

      await expect(userController.remove(userId)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
