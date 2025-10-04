export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const handleApiError = (error: any): AppError => {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details
    };
  }

  if (error?.status) {
    return {
      message: error.message || 'API 요청 중 오류가 발생했습니다.',
      status: error.status,
      code: error.code
    };
  }

  if (error?.message) {
    return {
      message: error.message,
      status: 500
    };
  }

  return {
    message: '알 수 없는 오류가 발생했습니다.',
    status: 500
  };
};

export const getErrorMessage = (error: AppError): string => {
  switch (error.status) {
    case 400:
      return '잘못된 요청입니다.';
    case 401:
      return '인증이 필요합니다.';
    case 403:
      return '접근 권한이 없습니다.';
    case 404:
      return '요청한 리소스를 찾을 수 없습니다.';
    case 429:
      return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
    case 500:
      return '서버 오류가 발생했습니다.';
    case 503:
      return '서비스를 일시적으로 사용할 수 없습니다.';
    default:
      return error.message || '알 수 없는 오류가 발생했습니다.';
  }
};
