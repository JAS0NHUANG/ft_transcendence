import { ApiProperty } from '@nestjs/swagger';
import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class AuthDto {
  id: string;

  @ApiProperty({ example: 'Elise007' })
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  userName: string;

  @ApiProperty({ example: 'example@site.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  image: string;

  @ApiProperty({ description: 'password', example: '12345' })
  @IsNotEmpty()
  @IsString()
  // @MinLength(8)
  // Commented for testing:
  // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  //   message:
  //     'password too weak. Need at least one uppercase letter, one lowercase letter and one digit.',
  // })
  password: string;

  @ApiProperty({ description: 'optional', example: '123456' })
  @IsOptional()
  @IsString()
  twoFACode: string;
}

export class LoginDto {
  @ApiProperty({ example: 'example@site.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class VerifyTwoFADTO {
  @ApiProperty({ description: 'code must be 6 characters long' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiProperty({
    description:
      'this is sent after password verification, but before 2FA verification',
  })
  @IsNotEmpty()
  @IsString()
  nonce: string;
}

export class EnableTwoFADTO {
  @ApiProperty({ description: 'code must be 6 characters long' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  code: string;
}
