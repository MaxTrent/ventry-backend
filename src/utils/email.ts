import sgMail from '@sendgrid/mail';
import config from '../config/env';
import logger from './logger';

sgMail.setApiKey(config.SENDGRID_API_KEY);

export const sendOtpEmail = async (to: string, otp: string): Promise<void> => {
  const msg = {
    to,
    from: config.SENDGRID_FROM_EMAIL,
    subject: 'Your OTP for Ventry Signup',
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
  };

  try {
    await sgMail.send(msg);
    logger.info({ to }, 'OTP email sent successfully');
  } catch (error: any) {
    logger.error({ error: error.message, to }, 'Failed to send OTP email');
    throw new Error('Failed to send OTP email');
  }
};

export const sendPurchaseConfirmationEmail = async (
  to: string,
  carBrand: string,
  carModel: string,
  amount: number
): Promise<void> => {
  const msg = {
    to,
    from: config.SENDGRID_FROM_EMAIL,
    subject: 'Ventry Purchase Confirmation',
    text: `Thank you for your purchase of a ${carBrand} ${carModel} for NGN ${amount.toLocaleString()}.`,
    html: `
      <p>Dear Customer,</p>
      <p>Thank you for your purchase!</p>
      <p><strong>Vehicle:</strong> ${carBrand} ${carModel}</p>
      <p><strong>Amount:</strong> NGN ${amount.toLocaleString()}</p>
      <p>We’ll contact you soon with next steps.</p>
      <p>Best regards,<br>Ventry Team</p>
    `,
  };

  try {
    await sgMail.send(msg);
    logger.info({ to, carBrand, carModel }, 'Purchase confirmation email sent successfully');
  } catch (error: any) {
    logger.error({ error: error.message, to }, 'Failed to send purchase confirmation email');
    throw new Error('Failed to send purchase confirmation email');
  }
};