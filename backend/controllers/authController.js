const authService = require('../services/authService');
const { SetupAccountDto, LoginPasswordDto, CreateAccessCodeDto, ValidateAccessCodeDto } = require('../dtos/authDto');

exports.setupAccount = async (req, res) => {
  try {
    const dto = new SetupAccountDto(req.body);
    dto.validate();
    const result = await authService.setupAccount(dto.userId, dto.username, dto.password);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in setupAccount:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.loginPassword = async (req, res) => {
  try {
    const dto = new LoginPasswordDto(req.body);
    dto.validate();
    const result = await authService.loginPassword(dto.username, dto.password);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in loginPassword:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.createAccessCode = async (req, res) => {
  try {
    const dto = new CreateAccessCodeDto(req.body);
    dto.validate();
    const result = await authService.requestAccessCode(dto.userId, dto.type);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in createAccessCode:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.validateAccessCode = async (req, res) => {
  try {
    const dto = new ValidateAccessCodeDto(req.body);
    dto.validate();
    const result = await authService.validateAccessCode(dto.userId, dto.accessCode);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in validateAccessCode:', error);
    res.status(400).json({ error: error.message });
  }
};
