import babel from 'rollup-plugin-babel';

const commonConfig = {
  input: 'src/reporterManager.js',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ],
  output: {
    external: [ '@sentry/core', '@sentry/browser', '@sentry/hub' ]
  }
};

export default [
  {
    ...commonConfig,
    output: {
      ...commonConfig.output,
      file: 'umd/index.js',
      format: 'umd',
      exports: 'named',
      name: 'ReporterManager',
      esModule: false,
    },
  },
  {
    ...commonConfig,
    output: {
      ...commonConfig.output,
      file: 'esm/index.js',
      format: 'esm',
    }
  }
];
