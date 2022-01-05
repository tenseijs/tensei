import { MakePluginOptions, FileContent } from '../types'

export function packageJson(options: MakePluginOptions): FileContent {
  if (options.withFrontend) {
    return {
      content: `{
  "name": "tensei-${options.name.slug}",
  "version": "1.0.0",
  "main": "./build/index.js",
  "license": "MIT",
  "types": "./build/index.d.ts",
  "files": [
    "build/"
  ],
  "scripts": {
    "format": "prettier --write './**/*.{js,json,ts,css,md}'",
    "build:server": "tsc --p tsconfig.server.json",
    "build:client": "cross-env NODE_ENV=production webpack --config=node_modules/laravel-mix/setup/webpack.config.js",
    "dev-server": "tsc --watch --p tsconfig.server.json",
    "dev-client": "cross-env NODE_ENV=development webpack --config=node_modules/laravel-mix/setup/webpack.config.js --watch",
    "build": "yarn build:server && yarn build:client",
    "dev": "concurrently 'npm:dev-client' 'npm:dev-server'"
  },
  "dependencies": {
    "@tensei/common": "${options.latestTenseiVersion}"
  },
  "publishConfig": {
    "access": "public"
  },
  "devDependencies": {
    "@tensei/components": "${options.latestTenseiVersion}",
    "@types/react": "^17.0.2",
    "concurrently": "^5.3.0",
    "cross-env": "^7.0.3",
    "laravel-mix": "^6.0.5",
    "prettier": "^2.0.5",
    "postcss": "^8.1",
    "postcss-loader": "^5.0.0",
    "react": "17.0.2",
    "ts-loader": "^8.0.12",
    "typescript": "^4.5.4"
  }
}`,
      location: 'package.json',
      sides: ['frontend', 'backend']
    }
  }

  return {
    content: `{
  "name": "tensei-${options.name.slug}",
  "version": "1.0.0",
  "main": "./build/index.js",
  "license": "MIT",
  "types": "./build/index.d.ts",
  "files": [
    "build/"
  ],
  "scripts": {
    "format": "prettier --write './**/*.{js,json,ts,md}'",
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@tensei/common": "${options.latestTenseiVersion}"
  },
  "publishConfig": {
    "access": "public"
  },
  "devDependencies": {
    "prettier": "^2.0.5",
    "typescript": "^4.5.4"
  }
}`,
    location: 'package.json',
    sides: ['frontend', 'backend']
  }
}
