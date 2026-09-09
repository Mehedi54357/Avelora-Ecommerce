import { CustomersService } from './customers.service';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    getCustomers(query: any): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/customer.schema").CustomerDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/customer.schema").Customer & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getCustomerById(id: string): Promise<{
        customer: import("mongoose").Document<unknown, {}, import("../../schemas/customer.schema").CustomerDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/customer.schema").Customer & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
        orders: (import("mongoose").Document<unknown, {}, import("../../schemas/order.schema").OrderDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
}
