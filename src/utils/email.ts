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
  } catch (error) {
    logger.error({ error, to }, 'Failed to send OTP email');
    throw new Error('Failed to send OTP email');
  }
};