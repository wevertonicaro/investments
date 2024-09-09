import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { CreateInvestmentDto } from '../dtos/create-investment.dto';
import { Investment } from '../entities/investment.entity';
import { InvestmentService } from '../services/investment.service';

describe('InvestmentService', () => {
  let service: InvestmentService;
  let repository: Repository<Investment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestmentService,
        {
          provide: Repository,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InvestmentService>(InvestmentService);
    repository = module.get<Repository<Investment>>(Repository);
  });

  describe('create', () => {
    it('should create and return an investment', async () => {
      const dto: CreateInvestmentDto = {
        initialValue: 1000,
        owner: 1,
        creationDate: '2024-09-09T03:50:30.777Z',
      };

      const createdInvestment: Investment = {
        ...dto,
        creationDate: new Date(dto.creationDate),
        currentValue: dto.initialValue,
        id: 1,
        user: { id: dto.owner } as any, // Mock user
        isActive: true,
      } as Investment;

      jest.spyOn(repository, 'create').mockReturnValue(createdInvestment);
      jest.spyOn(repository, 'save').mockResolvedValue(createdInvestment);

      await expect(service.create(dto)).resolves.toEqual(createdInvestment);
      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        creationDate: new Date(dto.creationDate),
        isActive: true,
      });
      expect(repository.save).toHaveBeenCalledWith(createdInvestment);
    });

    it('should throw BadRequestException if initial value is negative', async () => {
      const dto: CreateInvestmentDto = {
        initialValue: -1000,
        owner: 1,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getById', () => {
    it('should return an investment by id', async () => {
      const investment: Investment = {
        id: 1,
        initialValue: 1000,
        owner: 1,
        creationDate: new Date(),
        currentValue: 1000,
        user: { id: 1 } as any, // Mock user
        isActive: true,
      } as Investment;

      jest.spyOn(repository, 'findOne').mockResolvedValue(investment);

      await expect(service.getById(1)).resolves.toEqual(investment);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if investment is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.getById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('withdraw', () => {
    it('should withdraw an amount and return updated investment', async () => {
      const investment: Investment = {
        id: 1,
        initialValue: 1000,
        owner: 1,
        creationDate: new Date(),
        currentValue: 1200,
        user: { id: 1 } as any, // Mock user
        isActive: true,
      } as Investment;

      const amount = 100;
      const amountAfterTax = 100 * 0.775; // Applying tax rate of 22.5%
      const updatedInvestment: Investment = {
        ...investment,
        currentValue: investment.currentValue - amountAfterTax,
      } as Investment;

      jest.spyOn(service, 'calculateGains').mockReturnValue(2000);
      jest.spyOn(service, 'applyTax').mockReturnValue(amountAfterTax);
      jest.spyOn(repository, 'findOne').mockResolvedValue(investment);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedInvestment);

      await expect(service.withdraw(1, amount)).resolves.toEqual(
        updatedInvestment
      );
      expect(service.calculateGains).toHaveBeenCalledWith(investment);
      expect(service.applyTax).toHaveBeenCalledWith(
        amount,
        investment.creationDate
      );
      expect(repository.save).toHaveBeenCalledWith({
        ...investment,
        currentValue: updatedInvestment.currentValue,
      });
    });

    it('should throw BadRequestException if withdrawal amount is negative', async () => {
      await expect(service.withdraw(1, -100)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException if insufficient funds for withdrawal', async () => {
      jest.spyOn(service, 'calculateGains').mockReturnValue(50);

      await expect(service.withdraw(1, 100)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('list', () => {
    it('should return a list of investments and total count', async () => {
      const investments: Investment[] = [
        {
          id: 1,
          initialValue: 1000,
          owner: 1,
          creationDate: new Date(),
          currentValue: 1000,
          user: { id: 1 } as any, // Mock user
          isActive: true,
        },
      ];
      const total = 1;

      jest
        .spyOn(repository, 'findAndCount')
        .mockResolvedValue([investments, total]);

      await expect(service.list(1)).resolves.toEqual({ investments, total });
      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { user: { id: 1 }, isActive: undefined },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('calculateGains', () => {
    it('should calculate the correct gains', () => {
      const investment: Investment = {
        initialValue: 1000,
        creationDate: new Date(
          new Date().getTime() - 1000 * 60 * 60 * 24 * 30 * 6
        ), // 6 months ago
        currentValue: 1000,
        user: { id: 1 } as any, // Mock user
        isActive: true,
      } as Investment;

      const expectedGains = 1000 * Math.pow(1 + 0.0052, 6) - 1000;
      expect(service.calculateGains(investment)).toBeCloseTo(expectedGains, 2);
    });
  });

  describe('applyTax', () => {
    it('should calculate the correct tax based on investment age', () => {
      const amount = 100;
      const creationDate = new Date(
        new Date().getTime() - 1000 * 60 * 60 * 24 * 365
      ); // 1 year ago

      expect(service.applyTax(amount, creationDate)).toBeCloseTo(
        amount * (1 - 0.185),
        2
      );
    });
  });
});
