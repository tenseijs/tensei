export const typeDefs = (name: string, plural: string) => {
  const { gql } = require('apollo-server-express')

  return gql`
        scalar Upload

        input UploadFilesInput {
            ${plural}: [Upload]!
            path: String
        }

        extend type Mutation {
            uploadFiles(object: UploadFilesInput!): [${name}]!
        }
    `
}
