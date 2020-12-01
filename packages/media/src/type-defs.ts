const gql = (t: any) => t

export const typeDefs = gql`
    scalar Upload

    input upload_files_input {
        files: [Upload]!
        path: String
    }

    extend type Mutation {
        upload_files(object: upload_files_input!): [file]!
    }
`
