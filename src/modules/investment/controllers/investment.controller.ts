import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateInvestmentDto } from '../dtos/create-investment.dto';
import { Investment } from '../entities/investment.entity';
import { InvestmentService } from '../services/investment.service';

@ApiTags('investments')
@Controller('investments')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Investment created successfully.',
    type: Investment,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(
    @Body() createInvestmentDto: CreateInvestmentDto
  ): Promise<Investment> {
    try {
      return await this.investmentService.create(createInvestmentDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Investment found.',
    type: Investment,
  })
  @ApiResponse({ status: 404, description: 'Investment not found.' })
  async getById(@Param('id', ParseIntPipe) id: number): Promise<Investment> {
    try {
      return await this.investmentService.getById(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Post(':id/withdraw')
  @ApiResponse({
    status: 200,
    description: 'Withdrawal successful.',
    type: Investment,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Investment not found.' })
  async withdraw(
    @Param('id', ParseIntPipe) id: number,
    @Body('amount') amount: number
  ): Promise<Investment> {
    try {
      return await this.investmentService.withdraw(id, amount);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else {
        throw new NotFoundException(error.message);
      }
    }
  }

  @Get()
  @ApiQuery({
    name: 'userId',
    type: Number,
    required: true,
    description: 'ID of the user whose investments are being queried.',
  })
  @ApiQuery({
    name: 'status',
    type: String,
    required: false,
    description: 'Filter investments by status: "active" or "inactive".',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for pagination.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of items per page for pagination.',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of investments.',
    type: [Investment],
  })
  async list(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('status') status?: string,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10
  ): Promise<{ investments: Investment[]; total: number }> {
    return this.investmentService.list(userId, status, page, limit);
  }
}
