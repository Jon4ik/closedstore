import { IsBoolean, IsEmail, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateTUDto {
  @IsString() @Length(2, 120) fullName!: string;
  @IsOptional() @IsString() @MaxLength(120) position?: string;
  @IsOptional() @IsString() @MaxLength(40) phone?: string | null;
  @IsOptional() @IsEmail() @MaxLength(254) email?: string | null;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateTUDto {
  @IsOptional() @IsString() @Length(2, 120) fullName?: string;
  @IsOptional() @IsString() @MaxLength(120) position?: string;
  @IsOptional() @IsString() @MaxLength(40) phone?: string | null;
  @IsOptional() @IsEmail() @MaxLength(254) email?: string | null;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
