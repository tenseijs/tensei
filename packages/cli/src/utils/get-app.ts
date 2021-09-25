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

export const getAppRootPath = () => {
  const packageJson = require(Path.resolve(
    getProjectDirectory(),
    'package.json'
  ))

  return packageJson.main as string
}

export const getProjectDirectory = () => process.cwd()

export const appPath = () =>
  Path.resolve(getProjectDirectory(), getAppRootPath())

export const app = async (invalidate = true) => {
  const path = appPath()

  if (invalidate) {
    decache(path)
  }

  const instance = require(path)

  let tensei: TenseiContract = await (instance.default
    ? instance.default
    : instance)

  return tensei
}
