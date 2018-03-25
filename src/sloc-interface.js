const nodeSloc = require("node-sloc");

module.exports = {
  getSloc
};

async function getSloc(path) {
  const { sloc } = await nodeSloc({ path });
  return sloc;
}
