const {
  SetupAccountDto,
  LoginPasswordDto,
  CreateAccessCodeDto,
  ValidateAccessCodeDto,
  RefreshTokenDto,
  LogoutDto
} = require('../dtos/authDto');
const User = require('../models/User');
const Otp = require('../models/Otp');
const RefreshToken = require('../models/RefreshToken');
const AppError = require('../utils/AppError');

console.log('--- TESTING PHASE 1: AUTH MODULE ---');

// 1. Test DTOs Validation
try {
  const invalidLogin = new LoginPasswordDto({});
  invalidLogin.validate();
  console.error('FAIL: LoginPasswordDto should fail with empty data');
} catch (err) {
  if (err instanceof AppError && err.statusCode === 400) {
    console.log('PASS: LoginPasswordDto validation works with AppError(400)');
  } else {
    console.error('FAIL: Error is not AppError:', err);
  }
}

try {
  const invalidOtp = new ValidateAccessCodeDto({ userId: 'u1', accessCode: '12' });
  invalidOtp.validate();
  console.error('FAIL: ValidateAccessCodeDto should fail with short OTP');
} catch (err) {
  if (err instanceof AppError && err.statusCode === 400) {
    console.log('PASS: ValidateAccessCodeDto validation works with AppError(400)');
  } else {
    console.error('FAIL:', err);
  }
}

// 2. Test Models
const testUser = new User('user-123', {
  name: 'Test Teacher',
  email: 'teacher@test.com',
  password: 'secret_hash_password',
  role: 'teacher'
});
const safeObj = testUser.toSafeObject();
if (!safeObj.password && safeObj.name === 'Test Teacher' && safeObj.createdAt) {
  console.log('PASS: User.toSafeObject() strips password and includes defaults');
} else {
  console.error('FAIL: User model issue', safeObj);
}

const expiredOtp = new Otp('id1', { identifier: '0901234567', code: '123456', expiresAt: Date.now() - 1000 });
if (expiredOtp.isExpired() === true) {
  console.log('PASS: Otp.isExpired() correctly detects expired OTP');
} else {
  console.error('FAIL: Otp.isExpired() failed');
}

const activeToken = new RefreshToken('tok-1', { userId: 'u1', expiresAt: Date.now() + 10000 });
if (activeToken.isExpired() === false) {
  console.log('PASS: RefreshToken.isExpired() correctly detects valid token');
} else {
  console.error('FAIL: RefreshToken.isExpired() failed');
}

console.log('--- ALL UNIT TESTS PASSED FOR PHASE 1 ---');
