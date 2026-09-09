import { Model } from 'mongoose';
import { Customer, CustomerDocument } from '../../schemas/customer.schema';
import { Order, OrderDocument } from '../../schemas/order.schema';
export declare class CustomersService {
    private customerModel;
    private orderModel;
    constructor(customerModel: Model<CustomerDocument>, orderModel: Model<OrderDocument>);
    findAll(query: {
        search?: string;
        limit?: number;
    }): Promise<(import("mongoose").Document<unknown, {}, CustomerDocument, {}, import("mongoose").DefaultSchemaOptions> & Customer & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findById(id: string): Promise<{
        customer: import("mongoose").Document<unknown, {}, CustomerDocument, {}, import("mongoose").DefaultSchemaOptions> & Customer & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
        orders: (import("mongoose").Document<unknown, {}, OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
}
