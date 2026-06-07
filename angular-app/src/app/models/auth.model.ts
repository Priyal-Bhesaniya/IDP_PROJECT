export interface MobileNumberRequest {
  mobileNumber: string;
}

export interface OTPRequest {
  mobileNumber: string;
  otp: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  token?: string;
}
