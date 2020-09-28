import { Request, Response } from 'express'
import { validateAll } from 'indicative/validator'

export const createTeam = async (request: Request, response: Response) => {
    const { manager, body, authUser } = request
    const { name } = await validate(body)

    const team = await manager('Team').create({
        name,
        customer_id: request.authUser!.id,
    })

    return response.json({ team })
}

const validate = async (data: { [key: string]: string }) => {
    let rules: {
        [key: string]: string
    } = {
        name: 'required',
    }

    return await validateAll(data, rules, {
        'name.required': 'The name is required.',
    })
}
