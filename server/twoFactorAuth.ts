import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import { db } from './db';
import { users, twoFactorSessions, twoFactorAuditLog } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const ENCRYPTION_KEY = process.env.TWO_FACTOR_ENCRYPTION_KEY || 'default-key-change-in-production';

export interface TwoFactorSetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export interface TwoFactorVerificationResult {
  success: boolean;
  token?: string;
  error?: string;
  remainingAttempts?: number;
}

export class TwoFactorAuthService {
  
  // Generate TOTP secret and QR code for setup
  async setupTOTP(userId: string, userEmail: string): Promise<TwoFactorSetupResponse> {
    const secret = speakeasy.generateSecret({
      name: `Durcheap (${userEmail})`,
      issuer: 'Durcheap Marketplace',
      length: 32
    });

    // Generate backup recovery codes
    const backupCodes = this.generateRecoveryCodes();
    
    // Encrypt the secret before storing
    const encryptedSecret = this.encrypt(secret.base32);
    const encryptedBackupCodes = backupCodes.map(code => this.encrypt(code));

    // Store in database but don't enable 2FA yet (user needs to verify first)
    await db.update(users)
      .set({
        twoFactorSecret: encryptedSecret,
        twoFactorRecoveryCodes: encryptedBackupCodes,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes,
      manualEntryKey: secret.base32
    };
  }

  // Verify TOTP token and enable 2FA
  async verifyAndEnableTOTP(userId: string, token: string, clientInfo: { ipAddress?: string; userAgent?: string }): Promise<TwoFactorVerificationResult> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user || !user.twoFactorSecret) {
        return { success: false, error: 'Two-factor authentication not set up' };
      }

      const decryptedSecret = this.decrypt(user.twoFactorSecret);
      const verified = speakeasy.totp.verify({
        secret: decryptedSecret,
        token,
        window: 2, // Allow 2 steps of drift
        time: Date.now() / 1000
      });

      if (verified) {
        // Enable 2FA
        await db.update(users)
          .set({
            twoFactorEnabled: true,
            twoFactorLastUsed: new Date(),
            updatedAt: new Date()
          })
          .where(eq(users.id, userId));

        // Log successful setup
        await this.logAuditEvent(userId, 'setup', 'totp', clientInfo, true);

        return { success: true };
      } else {
        // Log failed verification
        await this.logAuditEvent(userId, 'verify_fail', 'totp', clientInfo, false);
        return { success: false, error: 'Invalid verification code' };
      }
    } catch (error) {
      console.error('TOTP verification error:', error);
      return { success: false, error: 'Verification failed' };
    }
  }

  // Create 2FA session for login verification
  async createVerificationSession(userId: string, method: string = 'totp'): Promise<string> {
    const sessionToken = nanoid(32);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.insert(twoFactorSessions).values({
      userId,
      sessionToken,
      method,
      expiresAt
    });

    return sessionToken;
  }

  // Verify 2FA during login
  async verifyLoginToken(sessionToken: string, token: string, clientInfo: { ipAddress?: string; userAgent?: string }): Promise<TwoFactorVerificationResult> {
    try {
      const [session] = await db.select()
        .from(twoFactorSessions)
        .where(eq(twoFactorSessions.sessionToken, sessionToken));

      if (!session || session.expiresAt < new Date()) {
        return { success: false, error: 'Session expired or invalid' };
      }

      if (session.attempts >= session.maxAttempts) {
        return { success: false, error: 'Maximum attempts exceeded' };
      }

      const [user] = await db.select().from(users).where(eq(users.id, session.userId));
      if (!user || !user.twoFactorEnabled) {
        return { success: false, error: 'Two-factor authentication not enabled' };
      }

      let verified = false;

      // Verify based on method
      if (session.method === 'totp' && user.twoFactorSecret) {
        const decryptedSecret = this.decrypt(user.twoFactorSecret);
        verified = speakeasy.totp.verify({
          secret: decryptedSecret,
          token,
          window: 2
        });
      } else if (session.method === 'backup_code' && user.twoFactorRecoveryCodes) {
        verified = await this.verifyBackupCode(user.id, token);
      }

      // Update session attempts
      await db.update(twoFactorSessions)
        .set({
          attempts: session.attempts + 1,
          verified: verified
        })
        .where(eq(twoFactorSessions.id, session.id));

      if (verified) {
        // Update user's last 2FA usage
        await db.update(users)
          .set({ twoFactorLastUsed: new Date() })
          .where(eq(users.id, user.id));

        // Log successful verification
        await this.logAuditEvent(user.id, 'verify_success', session.method, clientInfo, true);

        return { success: true, token: sessionToken };
      } else {
        // Log failed verification
        await this.logAuditEvent(user.id, 'verify_fail', session.method, clientInfo, false);
        const remainingAttempts = session.maxAttempts - (session.attempts + 1);
        return { 
          success: false, 
          error: 'Invalid verification code',
          remainingAttempts: Math.max(0, remainingAttempts)
        };
      }
    } catch (error) {
      console.error('Login token verification error:', error);
      return { success: false, error: 'Verification failed' };
    }
  }

  // Verify backup/recovery code
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user || !user.twoFactorRecoveryCodes) {
        return false;
      }

      const encryptedCodes = user.twoFactorRecoveryCodes as string[];
      const decryptedCodes = encryptedCodes.map(encCode => this.decrypt(encCode));

      const codeIndex = decryptedCodes.indexOf(code);
      if (codeIndex === -1) {
        return false;
      }

      // Remove used backup code
      const remainingCodes = encryptedCodes.filter((_, index) => index !== codeIndex);
      await db.update(users)
        .set({
          twoFactorRecoveryCodes: remainingCodes,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      // Log recovery code usage
      await this.logAuditEvent(userId, 'recovery_used', 'backup_code', {}, true, { codesRemaining: remainingCodes.length });

      return true;
    } catch (error) {
      console.error('Backup code verification error:', error);
      return false;
    }
  }

  // Disable 2FA
  async disable2FA(userId: string, clientInfo: { ipAddress?: string; userAgent?: string }): Promise<boolean> {
    try {
      await db.update(users)
        .set({
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorRecoveryCodes: null,
          twoFactorBackupEmail: null,
          twoFactorPhone: null,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      // Log 2FA disable
      await this.logAuditEvent(userId, 'disable', null, clientInfo, true);

      return true;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      return false;
    }
  }

  // Generate new backup codes
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    const backupCodes = this.generateRecoveryCodes();
    const encryptedBackupCodes = backupCodes.map(code => this.encrypt(code));

    await db.update(users)
      .set({
        twoFactorRecoveryCodes: encryptedBackupCodes,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    return backupCodes;
  }

  // Send SMS verification (requires Twilio)
  async sendSMSVerification(phone: string): Promise<{ success: boolean; error?: string }> {
    // This would integrate with Twilio in production
    // For now, return success for demo purposes
    return { success: true };
  }

  // Send email verification
  async sendEmailVerification(email: string): Promise<{ success: boolean; error?: string }> {
    // This would integrate with SendGrid in production
    // For now, return success for demo purposes
    return { success: true };
  }

  // Private helper methods
  private generateRecoveryCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Generate 8-character alphanumeric codes
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  private encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  }

  private decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  private async logAuditEvent(
    userId: string,
    action: string,
    method: string | null,
    clientInfo: { ipAddress?: string; userAgent?: string },
    success: boolean,
    details?: any
  ): Promise<void> {
    try {
      await db.insert(twoFactorAuditLog).values({
        userId,
        action,
        method,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        success,
        details
      });
    } catch (error) {
      console.error('Error logging 2FA audit event:', error);
    }
  }

  // Check if 2FA is required for a specific action
  static requiresBalanceAccess2FA(user: any): boolean {
    return user?.twoFactorEnabled === true;
  }

  // Middleware to check 2FA session for balance access
  async validateBalanceAccess2FA(sessionToken: string): Promise<boolean> {
    try {
      const [session] = await db.select()
        .from(twoFactorSessions)
        .where(eq(twoFactorSessions.sessionToken, sessionToken));

      return session?.verified === true && session.expiresAt > new Date();
    } catch (error) {
      console.error('Error validating 2FA session for balance access:', error);
      return false;
    }
  }
}

export const twoFactorService = new TwoFactorAuthService();