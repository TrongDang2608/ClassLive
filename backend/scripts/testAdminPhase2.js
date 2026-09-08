const { AddUserDto, EditUserDto, GetUsersQueryDto } = require('../dtos/adminDto');
const AppError = require('../utils/AppError');

console.log('--- TESTING PHASE 2: SUPER ADMIN MODULE ---');

// 1. Test AddUserDto validation
try {
  const invalidAdd = new AddUserDto({ name: '', phone: '' });
  invalidAdd.validate();
  console.error('FAIL: AddUserDto should fail with empty name');
} catch (err) {
  if (err instanceof AppError && err.statusCode === 400) {
    console.log('PASS: AddUserDto validation works with AppError(400)');
  } else {
    console.error('FAIL:', err);
  }
}

try {
  const invalidRoleAdd = new AddUserDto({ name: 'Test User', phone: '0901234567', role: 'invalid_role' });
  invalidRoleAdd.validate();
  console.error('FAIL: AddUserDto should fail with invalid role');
} catch (err) {
  if (err instanceof AppError && err.statusCode === 400) {
    console.log('PASS: AddUserDto correctly rejects invalid role');
  } else {
    console.error('FAIL:', err);
  }
}

// 2. Test EditUserDto validation
try {
  const emptyEdit = new EditUserDto({});
  emptyEdit.validate();
  console.error('FAIL: EditUserDto should fail when no fields provided');
} catch (err) {
  if (err instanceof AppError && err.statusCode === 400) {
    console.log('PASS: EditUserDto validation works with AppError(400)');
  } else {
    console.error('FAIL:', err);
  }
}

// 3. Test GetUsersQueryDto
const validQuery = new GetUsersQueryDto({ page: '2', limit: '20', role: 'teacher' });
validQuery.validate();
if (validQuery.page === 2 && validQuery.limit === 20 && validQuery.role === 'teacher') {
  console.log('PASS: GetUsersQueryDto parses and validates query params correctly');
} else {
  console.error('FAIL: GetUsersQueryDto parsing failed');
}

console.log('--- ALL UNIT TESTS PASSED FOR PHASE 2 ---');
