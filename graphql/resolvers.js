const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = {
    // hello() {
    //     return {
    //         text: 'Hello world',
    //         views: 2134
    //     }
    // }
    createUser: async function({userInput}, req){
        const errors = [];
        if(!validator.isEmail(userInput.email)){
            errors.push("E-Mail id is invalid");
        }
        if(errors.length > 0){
            const error = new Error('Invalid input');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const exitingUser = await User.findOne({email: userInput.email});
        if(exitingUser){
            const error = new Error('User already exist');
            throw error;
        }
        const hashPwd = await bcrypt.hash(userInput.password, 12)
        const user = new User({
            email: userInput.email,
            name: userInput.name,
            password: hashPwd
        });
        const createdUser = await user.save();
        return {...createdUser._doc, _id:createdUser._id.toString() }
    },
    login: async function({email, password}){
        const user = await User.findOne({email: email});
        if(!user){
            const error = new Error('User not found');
            error.code = 401;
            throw error;
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if(!isEqual){
            const error = new Error('Password incorrect!!');
            error.code = 401;
            throw error;
        }
        const token = jwt.sign({
            userId: user._id.toString(),
            email: user.email
        },'secret', {expiresIn:'1h'})
        return {token: token, userId: user._id.toString()}
    }
}