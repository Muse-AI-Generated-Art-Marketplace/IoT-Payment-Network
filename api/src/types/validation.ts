import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  publicKey: Joi.string().required(),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const deviceRegistrationSchema = Joi.object({
  publicKey: Joi.string().required(),
  deviceType: Joi.string().required(),
  manufacturer: Joi.string().optional(),
  model: Joi.string().optional(),
  ratePerSecond: Joi.number().required(),
});

export const deviceUpdateSchema = Joi.object({
  deviceType: Joi.string().optional(),
  manufacturer: Joi.string().optional(),
  model: Joi.string().optional(),
  ratePerSecond: Joi.number().optional(),
  isActive: Joi.boolean().optional(),
});

export const sessionStartSchema = Joi.object({
  deviceId: Joi.string().required(),
  duration: Joi.number().required(),
  deposit: Joi.number().required(),
});

export const sessionEndSchema = Joi.object({
  sessionId: Joi.string().required(),
});

export const didCreateSchema = Joi.object({
  network: Joi.string().valid('testnet', 'public', 'local').required(),
  deviceType: Joi.string().required(),
  manufacturer: Joi.string().optional(),
  model: Joi.string().optional(),
  capabilities: Joi.array().items(Joi.string()).optional(),
});

export const didResolveSchema = Joi.object({
  did: Joi.string().required(),
});
