import { IsBoolean, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString() @Length(3, 64) @Matches(/^[a-zA-Z0-9._-]+$/) username!: string;
  @IsString() @Length(2, 120) fullName!: string;
  @IsString() @Length(12, 128) password!: string;
  @IsOptional() @IsString() @Length(1, 128) roleId?: string;
  @IsOptional() @IsString() @Length(1, 128) role?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateUserDto {
  @IsOptional() @IsString() @Length(3, 64) @Matches(/^[a-zA-Z0-9._-]+$/) username?: string;
  @IsOptional() @IsString() @Length(2, 120) fullName?: string;
  @IsOptional() @IsString() @Length(12, 128) password?: string;
  @IsOptional() @IsString() @Length(1, 128) roleId?: string;
  @IsOptional() @IsString() @Length(1, 128) role?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UsersQueryDto {
  @IsOptional() @IsString() @MaxLength(100) search?: string;
}
