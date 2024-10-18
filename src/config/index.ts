import * as process from 'process';

interface IStripeConfig {
  apiKey: string;
}

interface IJsonTokenEnv {
  accessSecret: string;
  refreshSecret: string;
}

interface ISendgridConfig {
  emailFrom: string;
  apiKey: string;
}

interface IGovernmentConfig {
  apiKey: string;
}

interface IAdminConfig {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ConfigProps {
  NODE_ENV: string;
  STRIPE: IStripeConfig;
  PORT: number;
  TOKEN: IJsonTokenEnv;
  MONGODB_URL: string;
  SENDGRID: ISendgridConfig;
  GOVERNMENT: IGovernmentConfig;
  ADMIN: IAdminConfig;
}

const getEnvVar = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (!value && !fallback) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value || fallback;
};

const configs = (): ConfigProps => ({
  MONGODB_URL: getEnvVar('MONGODB_URL'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 4000,
  STRIPE: {
    apiKey: getEnvVar('STRIPE_API_KEY'),
  },
  TOKEN: {
    accessSecret: getEnvVar('JWT_ACCESS_SECRET'),
    refreshSecret: getEnvVar('JWT_REFRESH_SECRET'),
  },
  SENDGRID: {
    emailFrom: getEnvVar('SENDGRID_EMAIL_FROM'),
    apiKey: getEnvVar('SENDGRID_API_KEY'),
  },
  GOVERNMENT: {
    apiKey: getEnvVar('GOVERNMENT_API_KEY'),
  },
  ADMIN: {
    email: getEnvVar('ADMIN_EMAIL'),
    password: getEnvVar('ADMIN_PASSWORD'),
    firstName: getEnvVar('ADMIN_FIRSTNAME'),
    lastName: getEnvVar('ADMIN_LASTNAME')
  },
});

export default configs;
