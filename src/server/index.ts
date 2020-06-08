import Flamingo from './Flamingo'
import FlamingoServiceProvider from './providers/FlamingoServiceProvider'

export = (
    root: string,
    ServiceProvider: typeof FlamingoServiceProvider
): Flamingo => {
    const flamingo = new Flamingo(root, ServiceProvider)

    return flamingo
}
