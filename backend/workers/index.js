const { initEmailWorker } = require('./emailWorker');

function initWorkers() {
  initEmailWorker();
}

module.exports = {
  initWorkers
};
