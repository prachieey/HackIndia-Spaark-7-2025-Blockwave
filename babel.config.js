export default {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current',
      },
      modules: 'auto',
    }],
    ['@babel/preset-react', {
      runtime: 'automatic',
      importSource: '@emotion/react',
    }],
  ],
  plugins: ['@emotion/babel-plugin'],
};
