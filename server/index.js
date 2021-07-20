const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());

const authRoutes = require('./routes/auth');
const verifyToken = require('./routes/verifyToken');

// Main API
app.get('/', (req, res) => {
    res.send("Welcome to the auth system");
})

// user profile API and add verify Token
app.get('/api/user/profile', verifyToken, (req, res) => {
    res.send({success: true, data: req.user})
})

app.use('/api/users', authRoutes);

// connect MongoDB Server
mongoose.connect('mongodb+srv://thanachai-node-react-native2:react-native-authApp1@cluster0.ffcxh.mongodb.net/auth_system?retryWrites=true&w=majority')
    .then(() => {
        app.listen(3000, () => console.log('Server is running'));
    })
    .catch(err => console.log(err))
