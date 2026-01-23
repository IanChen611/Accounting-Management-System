import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { PdfService } from './pdf.service';
import { ExcelService } from './excel.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly pdfService: PdfService,
    private readonly excelService: ExcelService,
  ) {}

  @Post()
  async create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return await this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.invoicesService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      startDate,
      endDate,
    });
  }

  @Get('export/csv')
  async exportCsv(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    const invoices = await this.invoicesService.findAllForExport({
      startDate,
      endDate,
      search,
    });

    // CSV 標頭
    const header = [
      '發票日期',
      '發票號碼',
      '客戶代號',
      '買受人',
      '品名',
      '數量',
      '單價',
      '金額',
      '未稅金額',
      '稅金',
      '含稅金額',
    ].join(',');

    // CSV 內容 - 每個商品一行
    const rows: string[] = [];
    invoices.forEach((invoice) => {
      if (invoice.items && invoice.items.length > 0) {
        const itemCount = invoice.items.length;
        invoice.items.forEach((item, index) => {
          const isLastItem = index === itemCount - 1;
          rows.push(
            [
              index === 0 ? invoice.invoiceDate : '', // 只在第一個商品顯示發票資訊
              index === 0 ? invoice.invoiceNumber : '',
              index === 0 ? invoice.customerCode || '' : '',
              index === 0 ? invoice.buyer : '',
              item.productName,
              item.quantity,
              item.unitPrice,
              item.amount,
              isLastItem ? invoice.taxExcludedAmount : '', // 只在最後一個商品顯示總額
              isLastItem ? invoice.tax : '',
              isLastItem ? invoice.taxIncludedAmount : '',
            ].join(','),
          );
        });
      }
    });

    const csv = [header, ...rows].join('\n');

    // 設定 BOM 以支援中文
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoices_${new Date().toISOString().split('T')[0]}.csv`,
    );

    return res.status(HttpStatus.OK).send(csvWithBom);
  }

  @Get('export/pdf')
  async exportPdf(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    const invoices = await this.invoicesService.findAllForExport({
      startDate,
      endDate,
      search,
    });
    const pdfBuffer = await this.pdfService.generateInvoicesPdf(invoices);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoices_${new Date().toISOString().split('T')[0]}.pdf`,
    );

    return res.status(HttpStatus.OK).send(pdfBuffer);
  }

  @Get('export/excel')
  async exportExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    const invoices = await this.invoicesService.findAllForExport({
      startDate,
      endDate,
      search,
    });
    const excelBuffer = await this.excelService.generateInvoicesExcel(invoices);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoices_${new Date().toISOString().split('T')[0]}.xlsx`,
    );

    return res.status(HttpStatus.OK).send(excelBuffer);
  }

  @Get('date-constraints/:invoiceNumber')
  async getDateConstraints(@Param('invoiceNumber') invoiceNumber: string) {
    return await this.invoicesService.getInvoiceDateConstraints(invoiceNumber);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.invoicesService.findOne(Number(id));
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return await this.invoicesService.update(Number(id), updateInvoiceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.invoicesService.remove(Number(id));
    return { message: '刪除成功' };
  }
}
