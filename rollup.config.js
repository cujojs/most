import buble from 'rollup-plugin-buble'
import commonjs from 'rollup-plugin-commonjs'

export default {
  entry: 'most.js',
  plugins: [buble(), commonjs()],
  format: 'umd',
  exports: 'named',
  moduleName: 'most',
  dest: 'dist/most.js',
  globals: {
    '@most/multicast': 'mostMulticast',
    '@most/prelude': 'mostPrelude',
    'symbol-observable': 'symbolObservable'
  }
}
