import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateInvestmentDto } from '../dtos/create-investment.dto';
import { Investment } from '../entities/investment.entity';

@Injectable()
export class InvestmentService {
  private readonly interestRate = 0.0052;

  constructor(
    @InjectRepository(Investment)
    private readonly investmentRepository: Repository<Investment>
  ) {}

  async create(dto: CreateInvestmentDto): Promise<Investment> {
    this.validateInitialValue(dto.initialValue);

    const investment = this.createInvestmentEntity(dto);

    return this.investmentRepository.save(investment);
  }

  async getById(id: number): Promise<Investment> {
    const investment = await this.investmentRepository.findOne({
      where: { id },
    });
    if (!investment) {
      throw new NotFoundException('Investment not found.');
    }
    return investment;
  }

  async withdraw(id: number, amount: number): Promise<Investment> {
    const investment = await this.getById(id);
    this.validateWithdrawalAmount(amount);

    const availableAmount = this.calculateAvailableAmount(investment);
    this.validateSufficientFunds(amount, availableAmount);

    const amountAfterTax = this.calculateAmountAfterTax(
      amount,
      investment.creationDate
    );

    const updatedInvestment = await this.updateInvestmentValue(
      investment,
      amountAfterTax
    );
    return updatedInvestment;
  }

  async list(
    userId: number,
    status?: string,
    page = 1,
    limit = 10
  ): Promise<{ investments: Investment[]; total: number }> {
    const options: FindManyOptions<Investment> = {
      where: {
        user: { id: userId },
        isActive: this.getStatus(status),
      },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [investments, total] =
      await this.investmentRepository.findAndCount(options);

    return { investments, total };
  }

  private validateInitialValue(value: number): void {
    if (value < 0) {
      throw new BadRequestException('Initial value cannot be negative');
    }
  }

  private createInvestmentEntity(dto: CreateInvestmentDto): Investment {
    return this.investmentRepository.create({
      ...dto,
      creationDate: dto.creationDate ? new Date(dto.creationDate) : new Date(),
    });
  }

  private validateWithdrawalAmount(amount: number): void {
    if (amount <= 0) {
      throw new BadRequestException('Withdrawal amount must be positive.');
    }
  }

  private calculateAvailableAmount(investment: Investment): number {
    return this.calculateGains(investment);
  }

  private validateSufficientFunds(
    amount: number,
    availableAmount: number
  ): void {
    if (amount > availableAmount) {
      throw new BadRequestException('Insufficient funds for withdrawal.');
    }
  }

  private calculateAmountAfterTax(amount: number, creationDate: Date): number {
    const tax = this.calculateTax(amount, creationDate);
    return amount - tax;
  }

  private async updateInvestmentValue(
    investment: Investment,
    amountAfterTax: number
  ): Promise<Investment> {
    const updatedInvestment = await this.investmentRepository.save({
      ...investment,
      currentValue: investment.currentValue - amountAfterTax,
    });
    return updatedInvestment;
  }

  private calculateGains(investment: Investment): number {
    const monthsElapsed = this.calculateMonthsElapsed(
      new Date(investment.creationDate)
    );
    return (
      investment.initialValue * Math.pow(1 + this.interestRate, monthsElapsed) -
      investment.initialValue
    );
  }

  private calculateMonthsElapsed(creationDate: Date): number {
    return Math.floor(
      (new Date().getTime() - creationDate.getTime()) /
        (1000 * 60 * 60 * 24 * 30.44)
    );
  }

  private calculateTax(amount: number, creationDate: Date): number {
    const investmentAgeInYears =
      this.calculateInvestmentAgeInYears(creationDate);
    const taxRate = this.getTaxRate(investmentAgeInYears);
    return amount * taxRate;
  }

  private calculateInvestmentAgeInYears(creationDate: Date): number {
    return (
      (new Date().getTime() - creationDate.getTime()) /
      (1000 * 60 * 60 * 24 * 365.25)
    );
  }

  private getTaxRate(ageInYears: number): number {
    if (ageInYears < 1) {
      return 0.225;
    } else if (ageInYears < 2) {
      return 0.185;
    } else {
      return 0.15;
    }
  }

  private getStatus(status?: string): boolean | undefined {
    return status === 'active'
      ? true
      : status === 'inactive'
        ? false
        : undefined;
  }
}
