import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class WithdrawalDto {
  @ApiProperty({
    description: 'The amount to withdraw from the investment',
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
