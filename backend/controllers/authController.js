const authService = require('../services/authService');
const {
  SetupAccountDto,
  LoginPasswordDto,
  CreateAccessCodeDto,
  ValidateAccessCodeDto,
  RefreshTokenDto,
  LogoutDto
} = require('../dtos/authDto');
const catchAsync = require('../utils/catchAsync');

class AuthController {
  // POST /api/auth/setup-account
  setupAccount = catchAsync(async (req, res, next) => {
    const dto = new SetupAccountDto(req.body);
    dto.validate();

    const result = await authService.setupAccount(
      dto.token,
      dto.newUsername,
      dto.newPassword
    );

    res.status(200).json({
      success: true,
      message: result.message
    });
  });

  // POST /api/auth/login-password (Bước 1)
  loginPassword = catchAsync(async (req, res, next) => {
    const dto = new LoginPasswordDto(req.body);
    dto.validate();

    const result = await authService.loginPassword(dto.username, dto.password);

    res.status(200).json({
      success: true,
      message: result.message,
      userId: result.userId,
      maskedPhone: result.maskedPhone,
      data: {
        userId: result.userId,
        maskedPhone: result.maskedPhone
      }
    });
  });

  // POST /api/auth/createAccessCode (Bước 2: gửi lại OTP)
  createAccessCode = catchAsync(async (req, res, next) => {
    const dto = new CreateAccessCodeDto(req.body);
    dto.validate();

    const result = await authService.requestAccessCode(dto.userId, dto.type);

    res.status(200).json({
      success: true,
      message: result.message
    });
  });

  // POST /api/auth/validateAccessCode (Bước 3: xác thực OTP và nhận token)
  validateAccessCode = catchAsync(async (req, res, next) => {
    const dto = new ValidateAccessCodeDto(req.body);
    dto.validate();

    const result = await authService.validateAccessCode(dto.userId, dto.accessCode);

    res.status(200).json({
      success: true,
      ...result,
      data: result
    });
  });

  // POST /api/auth/refresh
  refreshToken = catchAsync(async (req, res, next) => {
    const dto = new RefreshTokenDto(req.body);
    dto.validate();

    const result = await authService.refreshToken(dto.refreshToken);

    res.status(200).json({
      success: true,
      token: result.token,
      data: result
    });
  });

  // POST /api/auth/logout
  logout = catchAsync(async (req, res, next) => {
    const dto = new LogoutDto(req.body);
    dto.validate();

    const result = await authService.logout(dto.refreshToken);

    res.status(200).json({
      success: true,
      message: result.message
    });
  });
}

module.exports = new AuthController();
