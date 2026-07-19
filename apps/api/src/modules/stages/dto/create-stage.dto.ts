import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateStageDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsInt()
  @Min(0)
  order!: number;
}
