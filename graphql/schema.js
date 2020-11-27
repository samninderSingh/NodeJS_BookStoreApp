const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }
    type User {
        _id: ID!
        name: String!
        email: String!
        password: String!
        status: String!
        posts: [Post!]!
    }
    input userInputData {
        email: String!
        name: String!
        password: String!
    }
    type RootMutation{
        createUser(userInput: userInputData): User!
    }
    type AuthData {
        token: String!
        userId: String!
    }
    type RootQuery {
        login(email:String!, password:String!): AuthData!
    }
    schema {
        query: RootQuery
        mutation: RootMutation
    }
`)
// type TestData {
//     text: String!
//     views: Int!
// }
// type RootQuery {
//     hello: TestData!
// }
// schema {
//     query: RootQuery
// }