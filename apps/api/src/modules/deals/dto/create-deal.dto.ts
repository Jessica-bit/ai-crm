import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateDealDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  contactId!: string;

  @IsOptional()
  @IsString()
  stageId?: string;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  expectedCloseAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
