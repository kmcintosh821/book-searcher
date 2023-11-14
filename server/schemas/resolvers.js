const { User } = require('../models')

const resolvers = {
    Query: {
        me: async (parent, args, { User }) => {
            return await User.findById(User.id);
        }
    },

    Mutation: {
        login: async ()
    }
}