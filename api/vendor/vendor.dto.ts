export interface VendorListQueryParamsDto {
  keyword?: string;
}

export interface VendorPathParamsDto {
  vendorId: number;
}

export interface VendorResponseDto {
  id?: number;
  name?: string;
  description?: string;
  balance?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface CreateVendorRequestDto {
  name: string;
  description?: string;
}

export interface UpdateVendorRequestDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface ChargeVendorRequestDto {
  amount: number;
  memo?: string;
  receiptFileId?: string;
}

export type VendorBalanceHistoryType = "CHARGE" | "DEDUCT";

export interface VendorBalanceHistoryResponseDto {
  id?: number;
  type?: VendorBalanceHistoryType;
  amount?: number;
  balanceAfter?: number;
  memo?: string;
  receiptFileId?: string;
  receiptFileUrl?: string;
  purchaseRequestId?: number;
  createdByName?: string;
  occurredAt?: string;
}
