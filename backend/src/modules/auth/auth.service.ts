import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { env } from "../../common/config/env.js";
import { UserModel } from "../../db/models/user.model.js";
import { RefreshTokenModel } from "../../db/models/refresh-token.model.js";
import { AppError } from "../../common/middlewares/error.middleware.js";
import { signAccess, signRefresh, verifyRefresh } from "../../common/utils/jwt.js";
import type { UserRole } from "../../common/types/auth.js";
import { generateToken, sha256 } from "../../common/utils/token.js";
import { sendEmail } from "../notifications/notify.js";

const buildVerificationUrl = (token: string): string =>
  `${env.APP_BASE_URL}/verify-email?token=${encodeURIComponent(token)}`;
const buildResetPasswordUrl = (token: string): string =>
  `${env.APP_BASE_URL}/reset-password?token=${encodeURIComponent(token)}`;

const issueEmailVerification = async (
  userId: string,
  email: string
): Promise<{ token: string; verificationUrl: string }> => {
  const token = generateToken();
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await UserModel.updateOne(
    { _id: userId },
    {
      $set: {
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpiresAt: expiresAt
      }
    }
  ).exec();

  const verificationUrl = buildVerificationUrl(token);
  try {
    await sendEmail(
      email,
      "Verify your Smart Parking account",
      `Click this link to verify your account: ${verificationUrl}\n\nThis link expires in 24 hours.`
    );
  } catch {
    if (env.NODE_ENV === "production") {
      throw new AppError("Failed to send verification email", 502);
    }
  }

  return { token, verificationUrl };
};

const issuePasswordReset = async (
  userId: string,
  email: string
): Promise<{ token: string; resetUrl: string }> => {
  const token = generateToken();
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await UserModel.updateOne(
    { _id: userId },
    {
      $set: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: expiresAt
      }
    }
  ).exec();

  const resetUrl = buildResetPasswordUrl(token);
  try {
    await sendEmail(
      email,
      "Reset your Smart Parking password",
      `Click this link to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`
    );
  } catch {
    if (env.NODE_ENV === "production") {
      throw new AppError("Failed to send password reset email", 502);
    }
  }

  return { token, resetUrl };
};

export const authService = {
  async register(input: { name: string; email: string; password: string; role: "admin" | "security" | "user" }) {
    const exists = await UserModel.findOne({ email: input.email }).exec();
    if (exists) {
      throw new AppError("Email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await UserModel.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role
    });

    const verification = await issueEmailVerification(user._id.toString(), user.email);

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: false,
      ...(env.NODE_ENV === "development" ? { verificationUrl: verification.verificationUrl } : {})
    };
  },

  async login(input: { email: string; password: string }) {
    const user = await UserModel.findOne({ email: input.email }).exec();
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError("Invalid credentials", 401);
    }
    if (!user.isEmailVerified) {
      throw new AppError("Email not verified. Please verify before login.", 403);
    }

    const tokenId = randomUUID();

    const role = user.role as UserRole;
    const accessToken = signAccess({ sub: user._id.toString(), role, email: user.email });
    const refreshToken = signRefresh({ sub: user._id.toString(), role, email: user.email, tokenId });

    await RefreshTokenModel.create({
      userId: user._id,
      tokenId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user._id.toString(), email: user.email, role, name: user.name }
    };
  },

  async refresh(refreshToken: string) {
    const payload = verifyRefresh(refreshToken);
    const tokenRow = await RefreshTokenModel.findOne({
      tokenId: payload.tokenId,
      revokedAt: { $exists: false },
      expiresAt: { $gt: new Date() }
    }).exec();

    if (!tokenRow) {
      throw new AppError("Invalid refresh token", 401);
    }

    const user = await UserModel.findById(payload.sub).exec();
    if (!user || !user.isActive) {
      throw new AppError("Unauthorized", 401);
    }

    const role = user.role as UserRole;
    const accessToken = signAccess({ sub: user._id.toString(), role, email: user.email });
    return { accessToken, user: { id: user._id.toString(), email: user.email, role, name: user.name } };
  },

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) {
      return;
    }

    try {
      const payload = verifyRefresh(refreshToken);
      await RefreshTokenModel.updateOne({ tokenId: payload.tokenId }, { $set: { revokedAt: new Date() } }).exec();
    } catch {
      return;
    }
  },

  async verifyEmail(token: string): Promise<void> {
    const tokenHash = sha256(token);
    const user = await UserModel.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { $gt: new Date() },
      isEmailVerified: false
    }).exec();

    if (!user) {
      throw new AppError("Invalid or expired verification token", 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpiresAt = null;
    await user.save();
  },

  async resendVerification(email: string): Promise<{ verificationUrl?: string }> {
    const user = await UserModel.findOne({ email }).exec();
    if (!user) {
      return {};
    }
    if (user.isEmailVerified) {
      return {};
    }

    const verification = await issueEmailVerification(user._id.toString(), user.email);
    return env.NODE_ENV === "development" ? { verificationUrl: verification.verificationUrl } : {};
  },

  async forgotPassword(email: string): Promise<{ resetUrl?: string }> {
    const user = await UserModel.findOne({ email }).exec();
    if (!user || !user.isEmailVerified || !user.isActive) {
      return {};
    }

    const reset = await issuePasswordReset(user._id.toString(), user.email);
    return env.NODE_ENV === "development" ? { resetUrl: reset.resetUrl } : {};
  },

  async resetPassword(input: { token: string; password: string }): Promise<void> {
    const tokenHash = sha256(input.token);
    const user = await UserModel.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
      isActive: true,
      isEmailVerified: true
    }).exec();

    if (!user) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    user.passwordHash = await bcrypt.hash(input.password, 12);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();
  }
};
