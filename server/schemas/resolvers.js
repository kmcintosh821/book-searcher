const { User } = require('../models')
const { signToken } = require('../utils/auth.js')

const resolvers = {
    Query: {
        me(_, __, context) {
            return context.user
        }
    },

    Mutation: {
        async login(_, args, context) {
            const { email, password } = args;
            const user = await User.findOne({ email }).populate('bookCount', 'savedBooks');
            if (!user) throw new Error('User not found.');

            const valid = await user.isCorrectPassword(password);
            return valid;
        },
        async addUser(_, args, context) {
            try {
                const user = await User.create(args);
                const token = await signToken(user.username, user.email, user._id);
                context.res.cookie('token', token, {
                    maxAge: 60 * 60 * 1000,
                    httpOnly: true
                })

                return user;
            } catch (err) {
                throw new Error(err.message)
            }
        },
        async saveBook(_, args, context) {
            try {
                const { input } = args;
                const user = me(_, __, context);
                const userProf = await User.findById({ _id: user._id  });
                userProf.savedBooks.insertOne({ input });
    
                return userProf;
            } catch (err) {
                throw new Error(err.message)
            }
        },
        async removeBook(_, args, context) {
            try {
                const { bookId } = args;
                const user = me(_, __, context);
                const userProf = await User.findById({ _id: user._id  });
                userProf.savedBooks.deleteOne({ _id: bookId });
    
                return userProf;
            } catch (err) {
                throw new Error(err.message)
            }
        }
    }
}