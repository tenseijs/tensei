import Axios from 'axios'
import { TenseiClient } from './client/src/rest'

const tensei = new TenseiClient({
    url: 'http://localhost:4001'
})

async function calls() {
    await tensei.categories.deleteMany({
        where: {
            id: {
                _in: [1, 2, 3, 4]
            }
        }
    })
}
