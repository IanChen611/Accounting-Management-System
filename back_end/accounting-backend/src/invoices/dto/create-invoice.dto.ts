import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsBoolean,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceItemDto } from './invoice-item.dto';

export class CreateInvoiceDto {
  @IsDateString()
  @IsNotEmpty({ message: '發票日期不可為空' })
  invoiceDate: string;

  @IsString()
  @IsNotEmpty({ message: '發票號碼不可為空' })
  @Matches(/^[A-Z]{2}\d{8}$/, {
    message: '發票號碼格式錯誤，必須為兩個英文字母加八位數字（例如：AB12345678）',
  })
  invoiceNumber: string;

  @IsBoolean()
  @IsOptional()
  isVoided?: boolean;

  @IsBoolean()
  @IsOptional()
  isBlank?: boolean;

  @IsBoolean()
  @IsOptional()
  isDualFormat?: boolean;

  @IsString()
  @IsOptional()
  customerCode?: string;

  @IsString()
  @IsOptional()
  buyer?: string;

  @IsArray({ message: '商品項目必須為陣列' })
  @ArrayMinSize(0, { message: '作廢發票可以沒有商品項目' })
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}
