import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { InvoiceItem } from './invoice-item.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', comment: '發票日期' })
  invoiceDate: string;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '發票號碼' })
  invoiceNumber: string;

  @Column({ type: 'boolean', default: false, comment: '是否作廢' })
  isVoided: boolean;

  @Column({ type: 'boolean', default: false, comment: '是否空白' })
  isBlank: boolean;

  @Column({ type: 'boolean', default: false, comment: '是否為二聯式發票' })
  isDualFormat: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '客戶代號' })
  customerCode: string;

  @Column({ type: 'varchar', length: 100, comment: '買受人' })
  buyer: string;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, {
    cascade: true,
    eager: true,
  })
  items: InvoiceItem[];

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '未稅金額（商品金額加總）',
  })
  taxExcludedAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '稅金',
  })
  tax: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '含稅金額',
  })
  taxIncludedAmount: number;

  @CreateDateColumn({ comment: '建立時間' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新時間' })
  updatedAt: Date;
}
