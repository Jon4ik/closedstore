import { IsIn, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';

export class UpdateMyProfileDto {
  @IsOptional() @IsString() @Length(3, 64) @Matches(/^[a-zA-Z0-9._-]+$/) username?: string;
  @IsOptional() @IsString() @Length(2, 120) fullName?: string;
  @IsOptional() @IsString() @MaxLength(128) chatId?: string | null;
  @IsOptional() @IsString() @MaxLength(128) telegramId?: string | null;
  @IsOptional() @IsIn(['light', 'dark', 'system']) theme?: 'light' | 'dark' | 'system';
}
