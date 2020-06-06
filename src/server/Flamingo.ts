import Consola from 'consola'
import { FlamingoServiceProviderInterface } from './typings/interfaces'
import FlamingoServiceProvider from './providers/FlamingoServiceProvider'

class Flamingo {
  private $serviceProvider: FlamingoServiceProviderInterface

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
    await this.$serviceProvider.register()

    this.$serviceProvider.launchServer((config) => {
      Consola.success('Server started on port', config.port)
    })
  }
}

export default Flamingo
