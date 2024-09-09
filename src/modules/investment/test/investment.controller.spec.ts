/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentController } from '../controllers/investment.controller';
import { CreateInvestmentDto } from '../dtos/create-investment.dto';
import { Investment } from '../entities/investment.entity';
import { InvestmentService } from '../services/investment.service';

describe('InvestmentController', () => {
  let controller: InvestmentController;
  let service: InvestmentService;

  const mockInvestmentService = {
    create: jest.fn(),
    getById: jest.fn(),
    withdraw: jest.fn(),
    list: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvestmentController],
      providers: [
        {
          provide: InvestmentService,
          useValue: mockInvestmentService,
        },
      ],
    }).compile();

    controller = module.get<InvestmentController>(InvestmentController);
    service = module.get<InvestmentService>(InvestmentService);
  });

  describe('create', () => {
    it('should create and return an investment', async () => {
      const dto: CreateInvestmentDto = { owner: 1, initialValue: 1000 };
      const investment: Investment = {
        id: 1,
        creationDate: new Date(),
        initialValue: dto.initialValue,
        owner: dto.owner,
        currentValue: dto.initialValue,
        isActive: true,
        user: null,
      } as Investment;

      mockInvestmentService.create.mockResolvedValue(investment);

      expect(await controller.create(dto)).toEqual(investment);
      expect(mockInvestmentService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequestException if initial value is negative', async () => {
      const dto: CreateInvestmentDto = { owner: 1, initialValue: -100 };

      mockInvestmentService.create.mockRejectedValue(
        new BadRequestException('Initial value cannot be negative')
      );

      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getById', () => {
    it('should return an investment if found', async () => {
      const investment: Investment = {
        id: 1,
        initialValue: 1000,
        currentValue: 1000,
        creationDate: new Date(),
        isActive: true,
        user: null, // Ajustar conforme necessário
      } as Investment;

      mockInvestmentService.getById.mockResolvedValue(investment);

      expect(await controller.getById(1)).toEqual(investment);
      expect(mockInvestmentService.getById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if investment not found', async () => {
      mockInvestmentService.getById.mockRejectedValue(
        new NotFoundException('Investment not found.')
      );

      await expect(controller.getById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('withdraw', () => {
    it('should withdraw and return updated investment', async () => {
      const investment: Investment = {
        id: 1,
        initialValue: 1000,
        currentValue: 1000,
        creationDate: new Date(),
        isActive: true,
        user: null, // Ajustar conforme necessário
      } as Investment;
      const updatedInvestment: Investment = {
        ...investment,
        currentValue: investment.currentValue - 100, // Mock value
      } as Investment;

      mockInvestmentService.withdraw.mockResolvedValue(updatedInvestment);

      expect(await controller.withdraw(1, 100)).toEqual(updatedInvestment);
      expect(mockInvestmentService.withdraw).toHaveBeenCalledWith(1, 100);
    });

    it('should throw BadRequestException if withdrawal amount is negative', async () => {
      mockInvestmentService.withdraw.mockRejectedValue(
        new BadRequestException('Withdrawal amount must be positive.')
      );

      await expect(controller.withdraw(1, -100)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw NotFoundException if investment not found', async () => {
      mockInvestmentService.withdraw.mockRejectedValue(
        new NotFoundException('Investment not found.')
      );

      await expect(controller.withdraw(1, 100)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('list', () => {
    it('should return a list of investments with total count', async () => {
      const investments: Investment[] = [
        {
          id: 1,
          initialValue: 1000,
          currentValue: 1000,
          creationDate: new Date(),
          isActive: true,
          user: null, // Ajustar conforme necessário
        },
      ];
      const total = 1;
      const result = { investments, total };

      mockInvestmentService.list.mockResolvedValue(result);

      expect(await controller.list(1, 'active', 1, 10)).toEqual(result);
      expect(mockInvestmentService.list).toHaveBeenCalledWith(
        1,
        'active',
        1,
        10
      );
    });
  });
});
