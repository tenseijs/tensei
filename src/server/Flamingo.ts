import Path from 'path'
import Consola from 'consola'
import Express from 'express'
import { FlamingoServiceProviderInterface, Asset } from './typings/interfaces'
import FlamingoServiceProvider from './providers/FlamingoServiceProvider'

class Flamingo {
    private $serviceProvider: FlamingoServiceProviderInterface

    public scripts: Asset[] = [
        {
            name: 'flamingo.js',
            path: Path.join(__dirname, '..', 'client', 'index.js'),
        },
    ]

    public styles: Asset[] = [
        {
            name: 'flamingo.css',
            path: Path.join(__dirname, '..', 'client', 'index.css'),
        },
    ]

    /**
     * A service provider is a class used to define all configurations
     * for flamingo. Routes, Cards, Resources, Authorization etc
     *
     * @param $serviceProvider FlamingoServiceProviderInterface
     */
    constructor(
        public $root: string,
        Provider: typeof FlamingoServiceProvider = FlamingoServiceProvider
    ) {
        this.$serviceProvider = new Provider($root)
    }

    public async start() {
        this.registerAssetsRoutes()

        await this.$serviceProvider.register()

        // this.$serviceProvider.launchServer((config) => {
        //     Consola.success('Server started on port', config.port)
        // })
    }

    public registerAssetsRoutes() {
        this.$serviceProvider.app.use(
            (
                request: Express.Request,
                response: Express.Response,
                next: Express.NextFunction
            ) => {
                request.scripts = this.scripts
                request.styles = this.styles

                next()
            }
        )

        this.scripts.concat(this.styles).forEach((asset) => {
            this.$serviceProvider.app.get(
                `/${asset.name}`,
                (request: Express.Request, response: Express.Response) =>
                    response.sendFile(asset.path)
            )
        })
    }

    public script(script: Asset) {
        this.scripts = [...this.scripts, script]

        return this
    }

    public style(style: Asset) {
        this.styles = [...this.styles, style]

        return this
    }
}

export default Flamingo
