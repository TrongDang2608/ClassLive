const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { emailQueue } = require('../queues/emailQueue');

function setupBullBoard() {
  try {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');

    const queues = [];
    if (emailQueue) {
      queues.push(new BullMQAdapter(emailQueue));
    }

    createBullBoard({
      queues,
      serverAdapter,
    });

    return serverAdapter.getRouter();
  } catch (error) {
    console.warn('⚠️ [Bull-Board Setup Warning]:', error.message);
    return (req, res) => res.status(500).json({ error: 'Bull-Board Dashboard chưa sẵn sàng.' });
  }
}

module.exports = {
  setupBullBoard
};
