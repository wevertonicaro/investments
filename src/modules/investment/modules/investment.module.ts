import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Investment } from '../entities/investment.entity';
import { InvestmentService } from '../services/investment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Investment])],
  providers: [InvestmentService],
  exports: [InvestmentService],
})
export class InvestmentModule {}
