import { gql } from 'apollo-server-express'

export const typeDefs = (name: string, plural: string) => gql`
    scalar Upload

    input upload_files_input {
        ${plural}: [Upload]!
        path: String
    }

    extend type Mutation {
        upload_files(object: upload_files_input!): [${name}]!
    }
`
