import { IsString, IsInt, IsNumber, Min, Length, IsOptional } from 'class-validator';

export class InvoiceItemDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsNumber()
  invoiceId?: number;

  @IsString()
  @Length(1, 200, { message: '品名長度需在 1-200 字元之間' })
  productName: string;

  @IsInt({ message: '數量必須為整數' })
  @Min(1, { message: '數量必須大於 0' })
  quantity: number;

  @IsNumber({}, { message: '金額必須為數字' })
  amount: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;
}
