import { IsOptional, IsPositive, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetPostsDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit: number = 10;

  @IsOptional()
  @Transform(({ value }: { value: string }) => (value === 'undefined' ? undefined : value))
  cursor?: string;
}
