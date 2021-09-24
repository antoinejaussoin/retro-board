// const rewireWorkspaces = require('react-app-rewire-yarn-workspaces');
// const rewireStyledComponents = require('react-app-rewire-styled-components');

// module.exports = function overrideCra(config, env) {
//   config = rewireWorkspaces(config, env);
//   config = rewireStyledComponents(config, env);
//   return config;
// };

const { addWebpackAlias, override } = require('customize-cra');

module.exports = override(
  addWebpackAlias({
    '@mui/styled-engine': '@mui/styled-engine-sc',
  })
);
