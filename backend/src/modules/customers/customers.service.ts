import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from '../../schemas/customer.schema';
import { Order, OrderDocument } from '../../schemas/order.schema';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async findAll(query: { search?: string; limit?: number }) {
    const filter: any = {};
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { mobile: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }
    const limit = Math.max(1, Math.min(200, Number(query.limit) || 100));

    return this.customerModel.find(filter).sort({ totalOrders: -1, createdAt: -1 }).limit(limit).exec();
  }

  async findById(id: string) {
    const customer = await this.customerModel.findById(id).exec();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    const orders = await this.orderModel.find({ customerId: customer._id as any }).sort({ createdAt: -1 }).exec();
    return { customer, orders };
  }
}
