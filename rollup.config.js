import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/screenshot-prevention.js',
      format: 'umd',
      name: 'ScreenshotPrevention',
      sourcemap: true
    },
    {
      file: 'dist/screenshot-prevention.esm.js',
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist/types'
    })
  ]
};