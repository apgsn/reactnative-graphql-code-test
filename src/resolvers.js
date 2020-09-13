/**
 * Query resolvers
 */
const validations = require("./validations.js");
const {UserInputError} = require("apollo-server");


module.exports = {
  Query: {
    users: async (_, __, {dataSources: {db}}) => await db('user'),
    posts: async (_, __, {dataSources: {db}}) => await db('post'),
    post: async (_, {parentId}, {dataSources: {db}}) => await db('post').where({parentId}),
    comments: async (_, __, {dataSources: {db}}) => await db('comment'),
  },

  Mutation: {
    // User actions
    login: async (_, {name}, {dataSources: {db}}) => {
      const trimmedName = name.trim();
      if (!trimmedName) {
        throw new UserInputError("Name cannot be an empty string")
      }
      
      // if user exists return it, otherwise return a new user
      const user = await db('user').where({name: trimmedName}).first();
      if (user) {
        return user;
      } else {
        const [newUser] = await db('user').insert({name: trimmedName}, ['*']);
        return newUser;
      }
    },

    // Post actions
    createPost: async (_, {userId, content, title}, {dataSources: {db}}) => {
      await validations.isUser(userId, db);

      const [newPost] = await db('post').insert({
        user_id: userId,
        content,
        title,
        created_at: new Date(),
      }, ['*']);
      return newPost;
    },
    editPost: async (_, {userId, id, content, title}, {dataSources: {db}}) => {
      await validations.owns(userId, id, 'post', db);

      const [post] = await db('post')
        .where({id})
        .update({content,title}, ['*']);
      return post;
    },
    deletePost: async (_, {userId, id}, {dataSources: {db}}) => {
      await validations.owns(userId, id, 'post', db);

      await db('post').where({id}).del();
      return true;
    },

    // Comment actions
    createComment: async (_, {userId, postId, content, title}, {dataSources: {db}}) => {
      await validations.owns(userId, postId, 'post', db);

      const [newComment] = await db('comment').insert({
        user_id: userId,
        parent_id: postId,
        content,
        title,
        created_at: new Date(),
      }, ['*']);
      return newComment;
    },
    editComment: async (_, {userId, id, content, title}, {dataSources: {db}}) => {
      await validations.owns(userId, id, 'comment', db);

      const [comment] = await db('comment')
        .where({id})
        .update({content, title}, ['*']);
      return comment;
    },
    deleteComment: async (_, {userId, id}, {dataSources: {db}}) => {
      await validations.owns(userId, id, 'comment', db);

      await db('comment').where({id}).del();
      return true;
    },

    // Like actions
    like: async (_, {userId, postId = null, commentId = null}, {dataSources: {db}}) => {
      validations.hasOneParent(postId, commentId);
      if (postId) {
        await validations.owns(userId, postId, 'post', db);
      } else {
        await validations.owns(userId, commentId, 'comment', db);
      }

      // YOLO (you only like once)
      const queryParams = {
        user_id: userId,
        parent_post_id: postId,
        parent_comment_id: commentId,
      }
      const like = await db('like').where(queryParams).first();
      if (like) {
        throw new UserInputError("Post/Comment is already liked")
      }

      await db('like').insert({...queryParams, created_at: new Date()}, ['*']);
      return true;
    },
    unlike: async (_, {userId, postId = null, commentId = null}, {dataSources: {db}}) => {
      validations.hasOneParent(postId, commentId);
      if (postId) {
        await validations.owns(userId, postId, 'post', db);
      } else {
        await validations.owns(userId, commentId, 'comment', db);
      }

      // Check that like exists
      const queryParams = {
        user_id: userId,
        parent_post_id: postId,
        parent_comment_id: commentId,
      }
      const like = await db('like').where(queryParams).first();
      if (!like) {
        throw new UserInputError("Post/Comment has not been liked")
      }

      await db('like').where(queryParams).del();
      return true;
    }
  }
}
