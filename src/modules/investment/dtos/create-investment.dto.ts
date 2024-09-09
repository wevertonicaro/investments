import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateInvestmentDto {
  @ApiProperty({
    description: 'The ID of the owner of the investment',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  owner: number;

  @ApiProperty({
    description: 'The date when the investment was created',
    example: '2024-09-01',
  })
  @IsOptional()
  @IsDateString()
  creationDate?: string;

  @ApiProperty({
    description: 'The initial value of the investment',
    example: 1000,
  })
  @IsNotEmpty()
  @IsNumber()
  initialValue: number;
}
