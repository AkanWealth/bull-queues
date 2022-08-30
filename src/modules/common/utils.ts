import axios from 'axios';
import { captureException } from '@sentry/node';
import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';

import { AppError, CreateErr, AuthenticatedRequest, Token, Staff } from 'package-types';

export const createError: CreateErr = (
  message,
  code = 403,
  validations = null,
) => {
  const err = new Error(message);
  // @ts-ignore
  err.code = code;
  // @ts-ignore
  err.validations = validations;
  return err;
};

export const success = (msg: string, data: any, meta?: object) => ({
  data,
  status: true,
  message: msg,
  ...(meta && { meta }),
});

export const AuthenticateUser = async (params: Token | Staff, expiresIn?: string) => {
  const { data } = await axios.post('https://arvo-gateway.herokuapp.com/auth', { data: params, expiresIn });
  return data.data;
};

export const forwardRequest = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const { app } = req;
  // eslint-disable-next-line no-underscore-dangle
  return app._router.handle(req, res, next);
};

export const validate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

    throw createError('Validation failed', 400, extractedErrors);
  } catch (e) {
    return next(e);
  }
};

export const httpInstance = (baseURL: string, param: unknown) => axios.create({
  baseURL,
  timeout: 5000000,
  headers: {
    'X-GATEWAY-AUTH': param,
    'Content-Type': 'application/json',
  },
});
