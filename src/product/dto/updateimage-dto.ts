import { Transform } from 'class-transformer';
import { IsOptional, IsArray, IsString } from 'class-validator';

function parseStringArray(value: unknown): string[] {
  if (typeof value !== 'string') return [];

  try {
    // Immediately check type without assigning to a variable
    const result = JSON.parse(value) as unknown;

    // Validate that it is a string array
    if (
      Array.isArray(result) &&
      result.every((item) => typeof item === 'string')
    ) {
      return result;
    }
  } catch {
    // ignore parse errors
  }

  return [];
}

export class UpdateImagesDto {
  @IsOptional()
  @Transform(({ value }) => parseStringArray(value))
  @IsArray()
  @IsString({ each: true })
  existingImages?: string[];

  @IsOptional()
  @Transform(({ value }) => parseStringArray(value))
  @IsArray()
  @IsString({ each: true })
  imagesToDelete?: string[];
}
