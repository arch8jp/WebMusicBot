module.exports = {
  entry: ['babel-polyfill', './src/vue.js'],
  output: {
    path: __dirname,
    filename: './public/js/bundle.js',
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm.js',
      vuex: 'vuex/dist/vuex.js',
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },
}
