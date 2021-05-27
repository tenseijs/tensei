import Fs from 'fs'
import Path from 'path'
import Rmrf from 'rimraf'
import Prettier from 'prettier'
import { plugin } from '@tensei/common'

import { generateResourceInterfaces } from './generators/interfaces'

function writeFileSyncRecursive(filename: string, content: string) {
	const folders = filename.split(Path.sep).slice(0, -1)
	if (folders.length) {
		// create folder path if it doesn't exist
		folders.reduce((last, folder) => {
			const folderPath = last ? last + Path.sep + folder : folder
			if (!Fs.existsSync(folderPath)) {
				Fs.mkdirSync(folderPath)
			}
			return folderPath
		})
	}
	Fs.writeFileSync(filename, content)
}

class Manda {
	private config = {
		path: '',
	}

	public path(path: string) {
		this.config.path = path

		return this
	}

	private cleanupClientFolder() {
		Rmrf.sync(this.config.path)
	}

	private createClientFolder() {
		Fs.mkdirSync(this.config.path)
	}

	private writeToClientFolder(content: string, path: string) {
		writeFileSyncRecursive(Path.join(this.config.path, path), content)
	}

	private formatContent(content: string) {
		return Prettier.format(content, {
			semi: false,
			parser: 'typescript',
		})
	}

	plugin() {
		return plugin('manda')
			.register(({ root }) => {
				if (!this.config.path) {
					this.config.path = Path.resolve(root, 'client/src') // Todo: Change this to the node_modules of the client folder.
				}
			})
			.boot(async (config) => {
				this.cleanupClientFolder()

				this.createClientFolder()

				this.writeToClientFolder(
					this.formatContent(await generateResourceInterfaces(config)),
					'interfaces.ts'
				)
			})
	}
}

export const manda = () => new Manda()

export const jsClient = () => new Manda()
