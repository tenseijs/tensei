import { promisify } from 'util'
import { pipeline as nodePipeline } from 'stream'
import { DefaultStorageResponse } from '@tensei/common'
import { dirname, join, resolve, relative, sep } from 'path'

export function isReadableStream(stream: any): stream is NodeJS.ReadableStream {
  return (
    stream !== null &&
    typeof stream === 'object' &&
    typeof stream.pipe === 'function' &&
    typeof stream._read === 'function' &&
    typeof stream._readableState === 'object' &&
    stream.readable !== false
  )
}

// public async put(location: string, content: Buffer | NodeJS.ReadableStream | string): Promise<Response> {
//   const fullPath = this._fullPath(location);

//   try {
//     if (isReadableStream(content)) {
//       const dir = dirname(fullPath);
//       await fse.ensureDir(dir);
//       const ws = fse.createWriteStream(fullPath);
//       await pipeline(content, ws);
//       return { raw: undefined };
//     }

//     const result = await fse.outputFile(fullPath, content);
//     return { raw: result };
//   } catch (e) {
//     throw handleError(e, location);
//   }
// }

export const pipeline = promisify(nodePipeline)
