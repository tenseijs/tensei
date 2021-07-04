import Path from 'path'
import Ts from 'rollup-plugin-typescript2'

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'lib',
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [Ts()],
  preserveModules: true,
  external: ['react', '@apollo/client', 'react-dom', '@headlessui/react']
}
