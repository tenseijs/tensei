import TextField from './fields/Text'
import DateField from './fields/Date'

class Flamingo {
    state = (() => {
        let user = null
        let resources = []

        try {
            user = JSON.parse(window.flamingoDefaultState.user)
            resources = JSON.parse(window.flamingoDefaultState.resources)
        } catch (errors) {}

        return {
            user,
            resources,
        }
    })()

    fieldComponents = {
        DateField,
        TextField,
    }
}

window.Flamingo = new Flamingo()
