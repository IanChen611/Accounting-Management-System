import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual, LessThan, MoreThan } from 'typeorm';
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
  // 如果是二聯式發票，商品金額為含稅價，需反推未稅金額
  private calculateInvoiceAmounts(items: InvoiceItem[], isDualFormat: boolean = false) {
    const TAX_RATE = 0.05;

    if (isDualFormat) {
      // 二聯式發票：商品金額為含稅價，需反推未稅金額
      // 含稅金額 = 所有商品的金額加總（四捨五入取整數）
      const taxIncludedAmount = Math.round(
        items.reduce((sum, item) => sum + Number(item.amount), 0),
      );

      // 未稅金額 = 含稅金額 / 1.05（四捨五入取整數）
      const taxExcludedAmount = Math.round(taxIncludedAmount / 1.05);

      // 稅金 = 含稅金額 - 未稅金額
      const tax = taxIncludedAmount - taxExcludedAmount;

      return {
        taxExcludedAmount,
        tax,
        taxIncludedAmount,
      };
    } else {
      // 一般發票：商品金額為未稅價
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
  }

  // 計算每個商品的單價
  // 單價 = 金額 ÷ 數量
  private calculateItemUnitPrice(amount: number, quantity: number): number {
    if (quantity === 0) return 0;
    return Math.round((amount / quantity) * 100) / 100;
  }

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const isVoided = createInvoiceDto.isVoided || false;
    const isBlank = createInvoiceDto.isBlank || false;
    const isDualFormat = createInvoiceDto.isDualFormat || false;

    // 建立發票主體
    const invoice = this.invoicesRepository.create({
      invoiceDate: createInvoiceDto.invoiceDate,
      invoiceNumber: createInvoiceDto.invoiceNumber,
      isVoided: isVoided,
      isBlank: isBlank,
      isDualFormat: isDualFormat,
      customerCode: (isVoided || isBlank) ? undefined : createInvoiceDto.customerCode,
      buyer: (isVoided || isBlank) ? '' : (createInvoiceDto.buyer || ''),
    });

    // 如果是作廢發票或空白發票，不需要商品和金額
    if (isVoided || isBlank) {
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

      // 計算發票總金額（根據是否為二聯式發票）
      const amounts = this.calculateInvoiceAmounts(items, isDualFormat);

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
    if (updateInvoiceDto.isVoided !== undefined) {
      invoice.isVoided = updateInvoiceDto.isVoided;
    }
    if (updateInvoiceDto.isBlank !== undefined) {
      invoice.isBlank = updateInvoiceDto.isBlank;
    }
    if (updateInvoiceDto.isDualFormat !== undefined) {
      invoice.isDualFormat = updateInvoiceDto.isDualFormat;
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

      // 計算新的總金額（根據是否為二聯式發票）
      const amounts = this.calculateInvoiceAmounts(newItems, invoice.isDualFormat);
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
    search?: string;
  }): Promise<Invoice[]> {
    const startDate = params?.startDate;
    const endDate = params?.endDate;
    const search = params?.search || '';

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

    const invoices = await this.invoicesRepository.find({
      where: whereConditions.length > 0 ? whereConditions : {},
      relations: ['items'],
    });

    // 排序：優先按發票號碼排序
    return invoices.sort((a, b) => {
      return a.invoiceNumber.localeCompare(b.invoiceNumber);
    });
  }

  // 取得發票日期限制（根據同字軌的前後一號發票）
  async getInvoiceDateConstraints(
    invoiceNumber: string,
    excludeId?: number,
  ): Promise<{
    minDate: string | null;
    maxDate: string | null;
    prevInvoice: { invoiceNumber: string; invoiceDate: string } | null;
    nextInvoice: { invoiceNumber: string; invoiceDate: string } | null;
  }> {
    // 發票號碼格式：XX12345678（兩個英文字母 + 八位數字）
    const prefix = invoiceNumber.substring(0, 2);
    const numberPart = invoiceNumber.substring(2);
    const currentNumber = parseInt(numberPart, 10);

    // 計算前後一號的發票號碼
    const prevNumber = currentNumber - 1;
    const nextNumber = currentNumber + 1;

    // 前一號發票號碼（補零到 8 位數）
    const prevInvoiceNumber = prevNumber >= 0 ? prefix + prevNumber.toString().padStart(8, '0') : null;

    // 後一號發票號碼（補零到 8 位數）
    const nextInvoiceNumber = nextNumber <= 99999999 ? prefix + nextNumber.toString().padStart(8, '0') : null;

    // 查詢前一號發票（如果是編輯模式，排除當前發票的 ID）
    let prevInvoiceQuery = this.invoicesRepository
      .createQueryBuilder('invoice')
      .select(['invoice.invoiceNumber', 'invoice.invoiceDate'])
      .where('invoice.invoiceNumber = :prevInvoiceNumber', { prevInvoiceNumber });

    if (excludeId !== undefined) {
      prevInvoiceQuery = prevInvoiceQuery.andWhere('invoice.id != :excludeId', { excludeId });
    }

    const prevInvoice = prevInvoiceNumber ? await prevInvoiceQuery.getOne() : null;

    // 查詢後一號發票（如果是編輯模式，排除當前發票的 ID）
    let nextInvoiceQuery = this.invoicesRepository
      .createQueryBuilder('invoice')
      .select(['invoice.invoiceNumber', 'invoice.invoiceDate'])
      .where('invoice.invoiceNumber = :nextInvoiceNumber', { nextInvoiceNumber });

    if (excludeId !== undefined) {
      nextInvoiceQuery = nextInvoiceQuery.andWhere('invoice.id != :excludeId', { excludeId });
    }

    const nextInvoice = nextInvoiceNumber ? await nextInvoiceQuery.getOne() : null;

    return {
      // 最小日期限制：前一號發票的日期（當前發票日期必須 >= 此日期）
      minDate: prevInvoice ? prevInvoice.invoiceDate : null,
      // 最大日期限制：後一號發票的日期（當前發票日期必須 <= 此日期）
      maxDate: nextInvoice ? nextInvoice.invoiceDate : null,
      prevInvoice: prevInvoice
        ? { invoiceNumber: prevInvoice.invoiceNumber, invoiceDate: prevInvoice.invoiceDate }
        : null,
      nextInvoice: nextInvoice
        ? { invoiceNumber: nextInvoice.invoiceNumber, invoiceDate: nextInvoice.invoiceDate }
        : null,
    };
  }
}
