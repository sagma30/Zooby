import { Response } from 'express';

export function successResponse(res: Response, data: any, message?: string, statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export const sendSuccess = successResponse;

export function errorResponse(res: Response, statusCode: number, message: string, code: string, errors?: any[]) {
  const response: any = {
    success: false,
    message,
    code,
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}
