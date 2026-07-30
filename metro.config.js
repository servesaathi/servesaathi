const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
  // zustand's ESM build uses `import.meta`, which SDK 54's Metro can't parse
  // (SDK 56 could — this surfaced with the 56→54 downgrade) and it crashes the
  // web bundle with "Cannot use 'import.meta' outside a module". Resolve
  // zustand through its CJS build instead, matching native behavior.
  resolveRequest: (context, moduleName, platform) => {
    if (moduleName === 'zustand' || moduleName.startsWith('zustand/')) {
      const subpath = moduleName === 'zustand' ? 'index' : moduleName.slice('zustand/'.length);
      return {
        type: 'sourceFile',
        filePath: path.join(path.dirname(require.resolve('zustand/package.json')), `${subpath}.js`),
      };
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
