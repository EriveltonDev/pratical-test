import { IsString, Length } from 'class-validator';

export class DashboardQueryDto {
  @IsString({ message: 'customerNumber is required and must be a string' })
  @Length(3, 20, { message: 'customerNumber must be between 3 and 20 characters' })
  customerNumber: string;
}