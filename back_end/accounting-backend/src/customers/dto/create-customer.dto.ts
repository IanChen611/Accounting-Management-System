import { IsString, IsOptional, Length, IsNotEmpty } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty({ message: '客戶代號不可為空' })
  @Length(1, 20, { message: '客戶代號長度需在 1-20 字元之間' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: '客戶名稱不可為空' })
  @Length(1, 100, { message: '客戶名稱長度需在 1-100 字元之間' })
  name: string;

  @IsString()
  @IsOptional()
  @Length(0, 200, { message: '聯絡地址長度不可超過 200 字元' })
  address?: string;

  @IsString()
  @IsOptional()
  @Length(0, 20, { message: '聯絡電話長度不可超過 20 字元' })
  phone?: string;
}
