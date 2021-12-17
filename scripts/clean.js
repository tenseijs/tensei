const Path = require('path')
const Rimraf = require('rimraf')

const packages = [
  'auth',
  'cashier',
  'media',
  'cli',
  'cms',
  'common',
  'components',
  'cookie-sessions',
  'core',
  'create-tensei-app',
  'express-session-mikro-orm',
  'graphql',
  'icons',
  'mail',
  'media',
  'next',
  ['next-auth', 'dist'],
  'nuxt',
  'orm',
  ['react-auth', 'dist'],
  'rest',
  'sdk',
  'social-auth',
  'field-json'
]

packages.forEach(package => {
  const [packageName, folder] = Array.isArray(package)
    ? package
    : [package, 'build']
  const path = Path.resolve(__dirname, '..', 'packages', packageName, folder)

  console.log('Cleaning', `packages/${packageName}/${folder}`)

  Rimraf.sync(path)
})
