import Path from 'path'
import decache from 'decache'
import { Server } from 'http'
import { TenseiContract } from '@tensei/common'
import { createHttpTerminator } from 'http-terminator'

export const kill = async (server: Server) => {
  const { terminate } = createHttpTerminator({
    server
  })

  await terminate()
}

const getAppRootPath = () => {
  const packageJson = require(Path.resolve(process.cwd(), 'package.json'))

  return packageJson.main
}

export const app = async (invalidate = true) => {
  const appPath = Path.resolve(process.cwd(), getAppRootPath())

  if (invalidate) {
    decache(appPath)
  }

  const instance = require(appPath)

  let tensei: TenseiContract = await (instance.default
    ? instance.default
    : instance)

  return tensei
}
