const authService = require('../services/authService');
const { SetupAccountDto, LoginPasswordDto, CreateAccessCodeDto, ValidateAccessCodeDto } = require('../dtos/authDto');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const jwt = require('jsonwebtoken');

exports.setupAccount = catchAsync(async (req, res, next) => {
  const { token, newUsername, newPassword } = req.body;
  
  if (!token || !newUsername || !newPassword) {
    throw new AppError('Token, Username và mật khẩu mới là bắt buộc', 400);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new AppError('Link thiết lập không hợp lệ hoặc đã hết hạn', 400);
  }

  const userId = decoded.id;
  const result = await authService.setupAccount(userId, newUsername, newPassword);
  res.status(200).json(result);
});

exports.loginPassword = catchAsync(async (req, res, next) => {
  const dto = new LoginPasswordDto(req.body);
  dto.validate();
  const result = await authService.loginPassword(dto.username, dto.password);
  res.status(200).json(result);
});

exports.createAccessCode = catchAsync(async (req, res, next) => {
  const dto = new CreateAccessCodeDto(req.body);
  dto.validate();
  const result = await authService.requestAccessCode(dto.userId, dto.type);
  res.status(200).json(result);
});

exports.validateAccessCode = catchAsync(async (req, res, next) => {
  const dto = new ValidateAccessCodeDto(req.body);
  dto.validate();
  const result = await authService.validateAccessCode(dto.userId, dto.accessCode);
  res.status(200).json(result);
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new AppError('Thiếu Refresh Token', 400);
  }
  const result = await authService.refreshToken(refreshToken);
  res.json(result);
});

exports.logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new AppError('Thiếu Refresh Token', 400);
  }
  const result = await authService.logout(refreshToken);
  res.json(result);
});
