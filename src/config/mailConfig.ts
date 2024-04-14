import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_REQUIRE_TLS, SMTP_AUTH_PASS, SMTP_AUTH_USER } from './config';

const smtpHost: string | undefined = SMTP_HOST;
const smtpPort: number | undefined = SMTP_PORT ? parseInt(SMTP_PORT, 10) : undefined;
const smtpSecure: boolean = SMTP_SECURE === 'true';
const smtpRequireTLS: boolean = SMTP_REQUIRE_TLS === 'true';
const smtpAuthUser: string | undefined = SMTP_AUTH_USER;
const smtpAuthPass: string | undefined = SMTP_AUTH_PASS;

const transport = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  requireTLS: smtpRequireTLS,
  auth: {
    user: smtpAuthUser,
    pass: smtpAuthPass,
  },
});

export default transport;
