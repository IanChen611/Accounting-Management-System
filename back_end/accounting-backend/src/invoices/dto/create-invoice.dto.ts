import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceItemDto } from './invoice-item.dto';

export class CreateInvoiceDto {
  @IsDateString()
  @IsNotEmpty({ message: '發票日期不可為空' })
  invoiceDate: string;

  @IsString()
  @IsNotEmpty({ message: '發票號碼不可為空' })
  invoiceNumber: string;

  @IsString()
  @IsOptional()
  customerCode?: string;

  @IsString()
  @IsNotEmpty({ message: '買受人不可為空' })
  buyer: string;

  @IsArray({ message: '商品項目必須為陣列' })
  @ArrayMinSize(1, { message: '至少需要一項商品' })
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}
