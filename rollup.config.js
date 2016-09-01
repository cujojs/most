import buble from 'rollup-plugin-buble'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'src/index.js',
  dest: 'dist/most.js',
  format: 'umd',
  moduleName: 'most',
  sourceMap: true,
  plugins: [
    buble(),
    nodeResolve({
      jsnext: true
    })
  ]
}
