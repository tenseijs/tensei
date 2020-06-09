import Flamingo from './Flamingo'
import BaseResource from './resources/Resource'
import FlamingoServiceProvider from './providers/FlamingoServiceProvider'

export const flamingo = (
    root: string,
    ServiceProvider: typeof FlamingoServiceProvider
): Flamingo => {
    const flamingo = new Flamingo(root, ServiceProvider)

    return flamingo
}

export const Resource = BaseResource
