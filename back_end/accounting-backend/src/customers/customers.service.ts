import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // 檢查客戶代號是否已存在
    const existing = await this.customersRepository.findOne({
      where: { code: createCustomerDto.code },
    });

    if (existing) {
      throw new ConflictException(
        `客戶代號 ${createCustomerDto.code} 已經存在`,
      );
    }

    const customer = this.customersRepository.create(createCustomerDto);
    return await this.customersRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return await this.customersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customersRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`客戶 ID ${id} 不存在`);
    }

    return customer;
  }

  async findByCode(code: string): Promise<Customer | null> {
    return await this.customersRepository.findOne({
      where: { code },
    });
  }

  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.findOne(id);

    // 如果更新客戶代號，檢查是否與其他客戶衝突
    if (
      updateCustomerDto.code &&
      updateCustomerDto.code !== customer.code
    ) {
      const existing = await this.customersRepository.findOne({
        where: { code: updateCustomerDto.code },
      });

      if (existing) {
        throw new ConflictException(
          `客戶代號 ${updateCustomerDto.code} 已經存在`,
        );
      }
    }

    Object.assign(customer, updateCustomerDto);
    return await this.customersRepository.save(customer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customersRepository.remove(customer);
  }
}
