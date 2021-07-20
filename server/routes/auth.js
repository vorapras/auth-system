const express = require('express');
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

const User = require('../models/User');

const registerValidation = [
    check('fullName')
        .isLength({min: 2})
        .withMessage('Your full name is required'),
    check('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    check('password')
        .isLength({min: 6})
        .withMessage('Password must be at least six characters')
]

const generateToken = user => {
    return jwt.sign(
        {_id: user._id, email: user.email, fullName: user.fullName}, 
        'SUPERSECRET123');
}

const loginValidation = [
    check('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    check('password')
        .isLength({min: 6})
        .withMessage('Password must be at least six characters')
]

// register API
router.post('/register', registerValidation, async (req, res) => {

    const errors = validationResult(req);

    // check isEmty?
    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    // check if email exist
    const userExist = await User.findOne({email: req.body.email});
    if (userExist) return res.status(400).send({success: false, message: 'Email already exists'});

    // encrypted password
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(req.body.password, salt)

    // create user
    const user = new User({
        fullName: req.body.fullName,
        email: req.body.email,
        password: hashPassword
    })

    // save data and show result
    try{
        const savedUser = await user.save();
        //create and assign a token
        const token = generateToken(user);
        res.send({
            success: true, 
            data: {
                id: savedUser._id, 
                fullName: savedUser.fullName, 
                email: savedUser.email
            },
            token
        });
    } catch (error) {
        res.status(400).send({success: false, error});
    }
})

// login API
router.post('/login', loginValidation, async(req, res) => {
    
    const errors = validationResult(req);

    // check isEmpty?
    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    // check if email exist
    const user = await User.findOne({email: req.body.email})
    if(!user) return res.status(404).send({success: false, message: 'User is not registered'})

    //check if password is correct
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if(!validPassword) return res.status(404).send({success: false, message: 'Invalid Email or Password'})

    //create and assign a token
    const token = generateToken(user);
    res.header('auth-token', token).send({success: true, message: 'Logged in successfully', token});
});

module.exports = router;