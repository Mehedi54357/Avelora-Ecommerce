import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { InventoryTransaction, InventoryTransactionDocument } from '../../schemas/inventory-transaction.schema';
import { Payment, PaymentDocument } from '../../schemas/payment.schema';
import { ReturnRequest, ReturnRequestDocument } from '../../schemas/return-request.schema';
import { InventoryService } from '../inventory/inventory.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class DataManagementService {
  private readonly logger = new Logger(DataManagementService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(InventoryTransaction.name) private txnModel: Model<InventoryTransactionDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(ReturnRequest.name) private returnModel: Model<ReturnRequestDocument>,
    private readonly inventoryService: InventoryService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getTestDataSummary() {
    const testProducts = await this.productModel
      .find({ dataMode: 'TEST' })
      .select('name slug salePrice status variants createdAt')
      .lean()
      .exec();

    const testOrders = await this.orderModel
      .find({ dataMode: 'TEST' })
      .select('orderId status paymentStatus fulfillmentMethod totalAmount paidAmount dueAmount createdAt')
      .lean()
      .exec();

    const testProductIds = testProducts.map((p) => p._id);
    const testOrderIds = testOrders.map((o) => o._id);
    const testOrderStrings = testOrders.map((o) => o.orderId);

    const [txnCount, paymentCount, returnCount] = await Promise.all([
      this.txnModel.countDocuments({
        $or: [
          { productId: { $in: testProductIds } },
          { orderId: { $in: testOrderStrings } },
        ],
      } as any).exec(),
      this.paymentModel.countDocuments({ orderId: { $in: testOrderIds } } as any).exec(),
      this.returnModel.countDocuments({ 'items.productId': { $in: testProductIds } } as any).exec(),
    ]);

    // Count active reservations on test products
    let testReservationsCount = 0;
    testProducts.forEach((p: any) => {
      (p.variants || []).forEach((v: any) => {
        testReservationsCount += Number(v.reservedQuantity || 0);
      });
    });

    return {
      testProductsCount: testProducts.length,
      testOrdersCount: testOrders.length,
      testTxnsCount: txnCount,
      testReservationsCount,
      testPaymentsCount: paymentCount,
      testReturnsCount: returnCount,
      testProducts,
      testOrders,
    };
  }

  async cleanupTestData(
    payload: {
      confirmationText: string;
      selectedProductIds?: string[];
      selectedOrderIds?: string[];
      cleanAll?: boolean;
    },
    actorId?: string,
  ) {
    if (!payload.confirmationText || payload.confirmationText.trim() !== 'DELETE TEST DATA') {
      throw new BadRequestException('Confirmation text mismatch. You must type "DELETE TEST DATA" to proceed.');
    }

    let targetOrders: any[] = [];
    let targetProducts: any[] = [];

    if (payload.cleanAll) {
      targetOrders = await this.orderModel.find({ dataMode: 'TEST' }).exec();
      targetProducts = await this.productModel.find({ dataMode: 'TEST' }).exec();
    } else {
      if (Array.isArray(payload.selectedOrderIds) && payload.selectedOrderIds.length > 0) {
        targetOrders = await this.orderModel
          .find({ _id: { $in: payload.selectedOrderIds }, dataMode: 'TEST' } as any)
          .exec();
      }
      if (Array.isArray(payload.selectedProductIds) && payload.selectedProductIds.length > 0) {
        targetProducts = await this.productModel
          .find({ _id: { $in: payload.selectedProductIds }, dataMode: 'TEST' } as any)
          .exec();
      }
    }

    const deletedOrderIds: string[] = [];
    const deletedProductIds: string[] = [];

    // 1. Release reservations and delete test orders
    for (const order of targetOrders) {
      for (const item of order.items) {
        try {
          await this.inventoryService.releaseReservation(
            item.productId.toString(),
            item.sku,
            item.quantity,
            order.orderId,
          );
        } catch (resErr: any) {
          this.logger.warn(`Reservation release notice on test cleanup: ${resErr.message}`);
        }
      }
      await this.paymentModel.deleteMany({ orderId: order._id } as any).exec();
      await this.orderModel.findByIdAndDelete(order._id).exec();
      deletedOrderIds.push(order.orderId);
    }

    // 2. Delete test transactions & test products
    for (const product of targetProducts) {
      await this.txnModel.deleteMany({ productId: product._id } as any).exec();
      await this.productModel.findByIdAndDelete(product._id).exec();
      deletedProductIds.push(product.slug);
    }

    await this.auditLogService.logAction({
      adminId: actorId,
      action: 'TEST_DATA_BULK_CLEANUP',
      entityType: 'DATA_MANAGEMENT',
      entityId: 'TEST_DATA_STORE',
      oldData: {
        deletedOrders: deletedOrderIds,
        deletedProducts: deletedProductIds,
      },
    });

    return {
      success: true,
      deletedOrdersCount: deletedOrderIds.length,
      deletedProductsCount: deletedProductIds.length,
      message: `Cleaned up ${deletedOrdersCount(deletedOrderIds)} test orders and ${deletedProductsCount(deletedProductIds)} test products. Stock reservations reconciled.`,
    };
  }
}

function deletedOrdersCount(arr: string[]): number {
  return arr.length;
}
function deletedProductsCount(arr: string[]): number {
  return arr.length;
}
