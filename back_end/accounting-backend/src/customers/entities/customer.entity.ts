import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true, comment: '客戶代號' })
  code: string;

  @Column({ type: 'varchar', length: 100, comment: '客戶名稱' })
  name: string;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: '郵遞區號' })
  zipCode: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '聯絡地址' })
  address: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '聯絡電話' })
  phone: string;

  @CreateDateColumn({ comment: '建立時間' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新時間' })
  updatedAt: Date;
}
