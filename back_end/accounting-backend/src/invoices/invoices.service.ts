import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemsRepository: Repository<InvoiceItem>,
  ) {}

  // 計算發票總金額
  // 商品邏輯：金額除以數量等於單價，未稅金額等於該發票的商品金額加總
  // 稅金等於未稅金額乘0.05，含稅金額等於未稅金額加上稅金
  // 所有金額四捨五入取整數
  private calculateInvoiceAmounts(items: InvoiceItem[]) {
    const TAX_RATE = 0.05;

    // 未稅金額 = 所有商品的金額加總（四捨五入取整數）
    const taxExcludedAmount = Math.round(
      items.reduce((sum, item) => sum + Number(item.amount), 0),
    );

    // 稅金 = 未稅金額 × 0.05（四捨五入取整數）
    const tax = Math.round(taxExcludedAmount * TAX_RATE);

    // 含稅金額 = 未稅金額 + 稅金
    const taxIncludedAmount = taxExcludedAmount + tax;

    return {
      taxExcludedAmount,
      tax,
      taxIncludedAmount,
    };
  }

  // 計算每個商品的單價
  // 單價 = 金額 ÷ 數量
  private calculateItemUnitPrice(amount: number, quantity: number): number {
    if (quantity === 0) return 0;
    return Math.round((amount / quantity) * 100) / 100;
  }

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const isVoided = createInvoiceDto.isVoided || false;

    // 建立發票主體
    const invoice = this.invoicesRepository.create({
      invoiceDate: createInvoiceDto.invoiceDate,
      invoiceNumber: createInvoiceDto.invoiceNumber,
      isVoided: isVoided,
      customerCode: isVoided ? undefined : createInvoiceDto.customerCode,
      buyer: isVoided ? '' : (createInvoiceDto.buyer || ''),
    });

    // 如果是作廢發票，不需要商品和金額
    if (isVoided) {
      invoice.taxExcludedAmount = 0;
      invoice.tax = 0;
      invoice.taxIncludedAmount = 0;
      invoice.items = [];
    } else {
      // 建立商品項目並計算單價
      const items = createInvoiceDto.items.map((itemDto) => {
        const unitPrice = this.calculateItemUnitPrice(
          itemDto.amount,
          itemDto.quantity,
        );

        return this.invoiceItemsRepository.create({
          productName: itemDto.productName,
          quantity: itemDto.quantity,
          amount: itemDto.amount,
          unitPrice: unitPrice,
        });
      });

      // 計算發票總金額
      const amounts = this.calculateInvoiceAmounts(items);

      // 將計算結果賦值給發票
      invoice.taxExcludedAmount = amounts.taxExcludedAmount;
      invoice.tax = amounts.tax;
      invoice.taxIncludedAmount = amounts.taxIncludedAmount;
      invoice.items = items;
    }

    // 儲存發票（會自動儲存 items，因為設定了 cascade: true）
    return await this.invoicesRepository.save(invoice);
  }

  async findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: Invoice[]; total: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const search = params?.search || '';
    const startDate = params?.startDate;
    const endDate = params?.endDate;

    // 建立查詢條件
    let whereConditions: any[] = [];

    if (search) {
      // 如果有搜尋關鍵字
      const searchConditions = [
        { invoiceNumber: Like(`%${search}%`) },
        { buyer: Like(`%${search}%`) },
        { customerCode: Like(`%${search}%`) },
      ];

      // 如果有日期範圍，加入日期條件
      if (startDate && endDate) {
        whereConditions = searchConditions.map(condition => ({
          ...condition,
          invoiceDate: Between(startDate, endDate),
        }));
      } else if (startDate) {
        whereConditions = searchConditions.map(condition => ({
          ...condition,
          invoiceDate: MoreThanOrEqual(startDate),
        }));
      } else if (endDate) {
        whereConditions = searchConditions.map(condition => ({
          ...condition,
          invoiceDate: LessThanOrEqual(endDate),
        }));
      } else {
        whereConditions = searchConditions;
      }
    } else {
      // 如果沒有搜尋關鍵字，只有日期範圍
      if (startDate && endDate) {
        whereConditions = [{ invoiceDate: Between(startDate, endDate) }];
      } else if (startDate) {
        whereConditions = [{ invoiceDate: MoreThanOrEqual(startDate) }];
      } else if (endDate) {
        whereConditions = [{ invoiceDate: LessThanOrEqual(endDate) }];
      }
    }

    const [data, total] = await this.invoicesRepository.findAndCount({
      where: whereConditions.length > 0 ? whereConditions : {},
      relations: ['items'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findOne(id: number): Promise<Invoice> {
    const invoice = await this.invoicesRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!invoice) {
      throw new NotFoundException(`發票 ID ${id} 不存在`);
    }

    return invoice;
  }

  async update(
    id: number,
    updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id);

    // 更新基本資訊
    if (updateInvoiceDto.invoiceDate !== undefined) {
      invoice.invoiceDate = updateInvoiceDto.invoiceDate;
    }
    if (updateInvoiceDto.invoiceNumber !== undefined) {
      invoice.invoiceNumber = updateInvoiceDto.invoiceNumber;
    }
    if (updateInvoiceDto.customerCode !== undefined) {
      invoice.customerCode = updateInvoiceDto.customerCode;
    }
    if (updateInvoiceDto.buyer !== undefined) {
      invoice.buyer = updateInvoiceDto.buyer;
    }

    // 如果有更新商品項目
    if (updateInvoiceDto.items !== undefined) {
      // 刪除舊的商品項目
      if (invoice.items && invoice.items.length > 0) {
        await this.invoiceItemsRepository.remove(invoice.items);
      }

      // 建立新的商品項目並計算單價
      const newItems = updateInvoiceDto.items.map((itemDto) => {
        const unitPrice = this.calculateItemUnitPrice(
          itemDto.amount,
          itemDto.quantity,
        );

        return this.invoiceItemsRepository.create({
          productName: itemDto.productName,
          quantity: itemDto.quantity,
          amount: itemDto.amount,
          unitPrice: unitPrice,
          invoice: invoice,
        });
      });

      // 計算新的總金額
      const amounts = this.calculateInvoiceAmounts(newItems);
      invoice.taxExcludedAmount = amounts.taxExcludedAmount;
      invoice.tax = amounts.tax;
      invoice.taxIncludedAmount = amounts.taxIncludedAmount;
      invoice.items = newItems;
    }

    return await this.invoicesRepository.save(invoice);
  }

  async remove(id: number): Promise<void> {
    const invoice = await this.findOne(id);
    await this.invoicesRepository.remove(invoice);
  }

  async findAllForExport(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<Invoice[]> {
    const startDate = params?.startDate;
    const endDate = params?.endDate;

    // 建立查詢條件
    let where: any = {};

    if (startDate && endDate) {
      where = { invoiceDate: Between(startDate, endDate) };
    } else if (startDate) {
      where = { invoiceDate: MoreThanOrEqual(startDate) };
    } else if (endDate) {
      where = { invoiceDate: LessThanOrEqual(endDate) };
    }

    const invoices = await this.invoicesRepository.find({
      where: Object.keys(where).length > 0 ? where : {},
      relations: ['items'],
    });

    // 自定義排序：先按發票字母分組，再按日期，最後按編號
    return invoices.sort((a, b) => {
      // 提取發票號碼的英文字母部分（前兩個字元）
      const prefixA = a.invoiceNumber.substring(0, 2);
      const prefixB = b.invoiceNumber.substring(0, 2);

      // 1. 先按英文字母排序
      if (prefixA !== prefixB) {
        return prefixA.localeCompare(prefixB);
      }

      // 2. 再按日期排序
      if (a.invoiceDate !== b.invoiceDate) {
        return a.invoiceDate.localeCompare(b.invoiceDate);
      }

      // 3. 最後按發票號碼排序
      return a.invoiceNumber.localeCompare(b.invoiceNumber);
    });
  }
}
