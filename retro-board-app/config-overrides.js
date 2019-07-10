const rewireReactHotLoader = require('react-app-rewire-hot-loader');
const rewireWorkspaces = require('react-app-rewire-yarn-workspaces');

module.exports = function override(config, env) {
  config = rewireReactHotLoader(config, env);
  config = rewireWorkspaces(config, env);
  return config;
};
