import * as process from 'process';

interface IStripeConfig {
  apiKey: string;
  webhookConfig: {
    requestBodyProperty: string;
    stripeSecrets: {
      account: string;
    };
  };
}

interface IJsonTokenEnv {
  accessSecret: string;
  refreshSecret: string;
}

interface ISendgridConfig {
  emailFrom: string;
  apiKey: string;
}

export interface ConfigProps {
  NODE_ENV: string;
  STRIPE: IStripeConfig;
  PORT: number;
  TOKEN: IJsonTokenEnv;
  MONGODB_URL: string;
  SENDGRID: ISendgridConfig;
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
    webhookConfig: {
      requestBodyProperty: 'rawBody',
      stripeSecrets: {
        account: getEnvVar('STRIPE_WEBHOOK_SECRET'),
      },
    },
  },
  TOKEN: {
    accessSecret: getEnvVar('JWT_ACCESS_SECRET'),
    refreshSecret: getEnvVar('JWT_REFRESH_SECRET'),
  },
  SENDGRID: {
    emailFrom: getEnvVar('SENDGRID_EMAIL_FROM'),
    apiKey: getEnvVar('SENDGRID_API_KEY'),
  },
});

export default configs;
