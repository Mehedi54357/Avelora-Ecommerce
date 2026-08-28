import { Document } from 'mongoose';
export type DeliveryZoneDocument = DeliveryZone & Document;
export declare class DeliveryZone {
    name: string;
    districts: string[];
    deliveryCharge: number;
    freeDeliveryThreshold?: number;
    estimatedDays?: string;
    isActive: boolean;
}
export declare const DeliveryZoneSchema: import("mongoose").Schema<DeliveryZone, import("mongoose").Model<DeliveryZone, any, any, any, any, any, DeliveryZone>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DeliveryZone, Document<unknown, {}, DeliveryZone, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<DeliveryZone & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    name?: import("mongoose").SchemaDefinitionProperty<string, DeliveryZone, Document<unknown, {}, DeliveryZone, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<DeliveryZone & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    districts?: import("mongoose").SchemaDefinitionProperty<string[], DeliveryZone, Document<unknown, {}, DeliveryZone, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<DeliveryZone & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    deliveryCharge?: import("mongoose").SchemaDefinitionProperty<number, DeliveryZone, Document<unknown, {}, DeliveryZone, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<DeliveryZone & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    freeDeliveryThreshold?: import("mongoose").SchemaDefinitionProperty<number, DeliveryZone, Document<unknown, {}, DeliveryZone, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<DeliveryZone & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    estimatedDays?: import("mongoose").SchemaDefinitionProperty<string, DeliveryZone, Document<unknown, {}, DeliveryZone, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<DeliveryZone & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, DeliveryZone, Document<unknown, {}, DeliveryZone, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<DeliveryZone & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, DeliveryZone>;
