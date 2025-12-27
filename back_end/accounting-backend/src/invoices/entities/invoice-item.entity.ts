import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: '發票ID' })
  invoiceId: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({ type: 'varchar', length: 200, comment: '品名' })
  productName: string;

  @Column({ type: 'int', comment: '數量' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '金額' })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '單價（計算）' })
  unitPrice: number;
}
