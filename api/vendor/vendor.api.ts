import authClient from "../client/authClient";
import type {
  ChargeVendorRequestDto,
  CreateVendorRequestDto,
  UpdateVendorRequestDto,
  VendorBalanceHistoryResponseDto,
  VendorListQueryParamsDto,
  VendorPathParamsDto,
  VendorResponseDto,
} from "./vendor.dto";

// 관리자 권한으로 거래처 목록을 조회하는 요청
export async function getVendors(query?: VendorListQueryParamsDto) {
  const response = await authClient.get<VendorResponseDto[]>("/api/v1/admin/vendors", {
    params: query,
  });
  return response.data;
}

// 관리자 권한으로 거래처를 생성하는 요청
export async function createVendor(body: CreateVendorRequestDto) {
  const response = await authClient.post<VendorResponseDto>("/api/v1/admin/vendors", body);
  return response.data;
}

// 관리자 권한으로 거래처 상세를 조회하는 요청
export async function getVendor(pathParams: VendorPathParamsDto) {
  const response = await authClient.get<VendorResponseDto>(
    `/api/v1/admin/vendors/${pathParams.vendorId}`,
  );
  return response.data;
}

// 관리자 권한으로 거래처를 수정하는 요청
export async function updateVendor(
  pathParams: VendorPathParamsDto,
  body: UpdateVendorRequestDto,
) {
  const response = await authClient.patch<VendorResponseDto>(
    `/api/v1/admin/vendors/${pathParams.vendorId}`,
    body,
  );
  return response.data;
}

// 관리자 권한으로 거래처를 삭제하는 요청
export async function deleteVendor(pathParams: VendorPathParamsDto) {
  await authClient.delete(`/api/v1/admin/vendors/${pathParams.vendorId}`);
}

// 관리자 권한으로 거래처 잔액을 충전하는 요청
export async function chargeVendor(
  pathParams: VendorPathParamsDto,
  body: ChargeVendorRequestDto,
) {
  const response = await authClient.post<VendorResponseDto>(
    `/api/v1/admin/vendors/${pathParams.vendorId}/charges`,
    body,
  );
  return response.data;
}

// 관리자 권한으로 거래처 잔액 이력을 조회하는 요청
export async function getVendorHistories(pathParams: VendorPathParamsDto) {
  const response = await authClient.get<VendorBalanceHistoryResponseDto[]>(
    `/api/v1/admin/vendors/${pathParams.vendorId}/histories`,
  );
  return response.data;
}
