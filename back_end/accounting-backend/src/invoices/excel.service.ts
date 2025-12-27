import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Invoice } from './entities/invoice.entity';

@Injectable()
export class ExcelService {
  async generateInvoicesExcel(invoices: Invoice[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('發票清單');

    // 設定欄位寬度
    worksheet.columns = [
      { width: 12 }, // 發票日期
      { width: 15 }, // 發票號碼
      { width: 12 }, // 客戶代號
      { width: 15 }, // 買受人
      { width: 20 }, // 品名
      { width: 10 }, // 數量
      { width: 12 }, // 單價
      { width: 12 }, // 金額
      { width: 12 }, // 未稅金額
      { width: 10 }, // 稅金
      { width: 12 }, // 含稅金額
    ];

    // 建立標頭
    const headerRow = worksheet.addRow([
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
    ]);

    // 標頭樣式
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    let currentRow = 2; // 從第 2 行開始（第 1 行是標頭）

    // 填入資料
    invoices.forEach((invoice) => {
      // 處理作廢發票（沒有商品項目）
      if (invoice.isVoided || !invoice.items || invoice.items.length === 0) {
        const row = worksheet.addRow([
          '作廢',
          invoice.invoiceNumber,
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
        ]);

        // 設定儲存格樣式
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        currentRow++;
      } else {
        // 處理正常發票
        const startRow = currentRow;
        const itemCount = invoice.items.length;

        invoice.items.forEach((item, index) => {
          const row = worksheet.addRow([
            index === 0 ? invoice.invoiceDate : '',
            index === 0 ? invoice.invoiceNumber : '',
            index === 0 ? invoice.customerCode || '' : '',
            index === 0 ? invoice.buyer : '',
            item.productName,
            item.quantity,
            Number(item.unitPrice),
            Number(item.amount),
            index === 0 ? Number(invoice.taxExcludedAmount) : '',
            index === 0 ? Number(invoice.tax) : '',
            index === 0 ? Number(invoice.taxIncludedAmount) : '',
          ]);

          // 設定儲存格樣式
          row.eachCell((cell, colNumber) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
            cell.alignment = { vertical: 'middle' };

            // 數字欄位靠右對齊
            if (colNumber >= 6) {
              cell.alignment = { vertical: 'middle', horizontal: 'right' };
            }

            // 數字格式
            if (colNumber === 7) {
              // 單價 - 保留兩位小數
              cell.numFmt = '#,##0.00';
            } else if (colNumber >= 6 && colNumber <= 11) {
              // 其他數字欄位 - 整數或兩位小數
              if (colNumber === 6) {
                // 數量 - 整數
                cell.numFmt = '#,##0';
              } else {
                // 金額、未稅金額、稅金、含稅金額 - 整數
                cell.numFmt = '#,##0';
              }
            }
          });

          currentRow++;
        });

        // 合併儲存格
        if (itemCount > 1) {
          const endRow = startRow + itemCount - 1;

          // 合併發票日期 (欄位 1)
          worksheet.mergeCells(startRow, 1, endRow, 1);
          // 合併發票號碼 (欄位 2)
          worksheet.mergeCells(startRow, 2, endRow, 2);
          // 合併客戶代號 (欄位 3)
          worksheet.mergeCells(startRow, 3, endRow, 3);
          // 合併買受人 (欄位 4)
          worksheet.mergeCells(startRow, 4, endRow, 4);
          // 合併未稅金額 (欄位 9)
          worksheet.mergeCells(startRow, 9, endRow, 9);
          // 合併稅金 (欄位 10)
          worksheet.mergeCells(startRow, 10, endRow, 10);
          // 合併含稅金額 (欄位 11)
          worksheet.mergeCells(startRow, 11, endRow, 11);

          // 設定合併儲存格的對齊方式為垂直置中
          for (let col = 1; col <= 4; col++) {
            const cell = worksheet.getCell(startRow, col);
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
          // 未稅金額、稅金、含稅金額靠右且垂直置中
          for (let col = 9; col <= 11; col++) {
            const cell = worksheet.getCell(startRow, col);
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
          }
        }
      }
    });

    // 產生 Buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
