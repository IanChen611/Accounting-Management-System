import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Invoice } from './entities/invoice.entity';

@Injectable()
export class PdfService {
  async generateInvoicesPdf(invoices: Invoice[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // 註冊支援中文的字體（需要下載字體檔案）
      // 如果沒有中文字體，可以使用預設字體，但中文會顯示不正確
      // doc.registerFont('NotoSans', 'path/to/NotoSansCJK-Regular.ttf');
      // doc.font('NotoSans');

      // 標題
      doc
        .fontSize(20)
        .text('Invoice List', { align: 'center' })
        .moveDown(2);

      let y = 150;

      invoices.forEach((invoice) => {
        // 檢查是否需要換頁
        if (y > 650) {
          doc.addPage();
          y = 50;
        }

        // 發票主資訊
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text(`Invoice: ${invoice.invoiceNumber}`, 50, y);
        doc.text(`Date: ${invoice.invoiceDate}`, 300, y);
        y += 20;

        doc.font('Helvetica');
        doc.text(`Customer Code: ${invoice.customerCode || 'N/A'}`, 50, y);
        doc.text(`Buyer: ${invoice.buyer}`, 300, y);
        y += 30;

        // 商品表格標頭
        this.generateItemTableHeader(doc, y);
        y += 25;

        // 商品項目
        if (invoice.items && invoice.items.length > 0) {
          invoice.items.forEach((item) => {
            // 檢查是否需要換頁
            if (y > 700) {
              doc.addPage();
              y = 50;
              this.generateItemTableHeader(doc, y);
              y += 25;
            }

            this.generateItemRow(doc, y, item);
            y += 20;
          });
        }

        y += 10;

        // 總計資訊
        doc.fontSize(9).font('Helvetica-Bold');
        doc.text(`Tax Excluded: $${invoice.taxExcludedAmount.toFixed(2)}`, 350, y);
        y += 15;
        doc.text(`Tax (5%): $${invoice.tax.toFixed(2)}`, 350, y);
        y += 15;
        doc.text(`Total: $${invoice.taxIncludedAmount.toFixed(2)}`, 350, y);
        y += 30;

        // 分隔線
        doc
          .moveTo(50, y)
          .lineTo(550, y)
          .stroke();
        y += 20;
      });

      // 頁碼
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .font('Helvetica')
          .text(
            `Page ${i + 1} / ${pages.count}`,
            50,
            doc.page.height - 50,
            { align: 'center' },
          );
      }

      doc.end();
    });
  }

  private generateItemTableHeader(doc: PDFKit.PDFDocument, y: number) {
    doc.fontSize(8).font('Helvetica-Bold');
    doc
      .text('Product Name', 50, y, { width: 150 })
      .text('Quantity', 210, y, { width: 50 })
      .text('Amount', 270, y, { width: 70 })
      .text('Unit Price', 350, y, { width: 70 });

    doc
      .moveTo(50, y + 15)
      .lineTo(430, y + 15)
      .stroke();
  }

  private generateItemRow(
    doc: PDFKit.PDFDocument,
    y: number,
    item: any,
  ) {
    doc.fontSize(7).font('Helvetica');
    doc
      .text(item.productName, 50, y, { width: 150 })
      .text(item.quantity.toString(), 210, y, { width: 50 })
      .text(item.amount.toFixed(2), 270, y, { width: 70 })
      .text(item.unitPrice.toFixed(2), 350, y, { width: 70 });
  }
}
