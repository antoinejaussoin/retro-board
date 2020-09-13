const rewireReactHotLoader = require('react-app-rewire-hot-loader');
const rewireWorkspaces = require('react-app-rewire-yarn-workspaces');
const rewireStyledComponents = require('react-app-rewire-styled-components');

module.exports = function overrideCra(config, env) {
  config = rewireReactHotLoader(config, env);
  config = rewireWorkspaces(config, env);
  config = rewireStyledComponents(config, env);
  return config;
};