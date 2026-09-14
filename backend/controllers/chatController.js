const chatService = require('../services/chatService');
const { GetMessagesDto } = require('../dtos/chatDto');
const catchAsync = require('../utils/catchAsync');

class ChatController {
  getContacts = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const role = req.user.role;
    
    const contacts = await chatService.getContacts(userId, role);
    
    res.status(200).json({
      success: true,
      data: contacts
    });
  });

  getMessages = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const dto = new GetMessagesDto(req.params);
    dto.validate();
    
    const messages = await chatService.getMessages(userId, dto.partnerId);
    
    res.status(200).json({
      success: true,
      data: messages
    });
  });
}

module.exports = new ChatController();
