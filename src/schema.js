/**
 * GraphQL schema used by Apollo server.
 */

const {gql} = require('apollo-server');

const typeDefs = gql`
  type User {
    id: ID!
    name: String
  }

  type Post {
    id: ID!
    title: String
    content: String!
    cratedAt: String!
    userId: Int!
  }

  type Comment {
    id: ID!
    title: String
    content: String!
    cratedAt: String!
    userId: Int!
    parentId: Int!
  }

  type Like {
    id: ID!
    cratedAt: String!
    userId: Int!
    parentPostId: Int
    parentCommentId: Int
  }

  type Query {
    users: [User]!
    posts: [Post]!
    comments(parentId: ID!): [Comment]!
    post(id: ID!): Post
  }

  type Mutation {
    login(name: String): User!
    logout: Boolean!

    createPost(content: String!, title: String): Post!
    editPost(id: ID!, content: String!, title: String): Post!
    deletePost(id: ID!): Boolean!

    createComment(content: String!, title: String): Comment!
    editComment(id: ID!, content: String!, title: String): Comment!
    deleteComment(id: ID!): Boolean!

    like(id: ID!, type: String): Boolean!
    unlike(id: ID!, type: String): Boolean!
  }
`;

module.exports = typeDefs;