const authService = require('../services/authService');
const { SetupAccountDto, LoginPasswordDto, CreateAccessCodeDto, ValidateAccessCodeDto } = require('../dtos/authDto');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.setupAccount = catchAsync(async (req, res, next) => {
  const dto = new SetupAccountDto(req.body);
  dto.validate();
  const result = await authService.setupAccount(dto.userId, dto.username, dto.password);
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
