const chatService = require('../services/chatService');
const catchAsync = require('../utils/catchAsync');

exports.getContacts = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  
  const contacts = await chatService.getContacts(userId, role);
  
  res.status(200).json({
    success: true,
    data: contacts
  });
});

exports.getMessages = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const partnerId = req.params.partnerId;
  
  const messages = await chatService.getMessages(userId, partnerId);
  
  res.status(200).json({
    success: true,
    data: messages
  });
});
