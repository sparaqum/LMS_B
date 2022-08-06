
//  SIGNIN ... SIGNUP....

const express = require('express');
const router = express.Router();

// mongodb user model
const UserVerification = require('../models/UserVerification');

// mongodb user verfication model
const User = require('../models/User');

// email handler
const nodemailer = require('nodemailer');

// generate Unique string
const {v4: uuidv4} = require('uuid');

// env variables
require('dotenv').config();


// password handler
const bcrypt = require('bcrypt');
const { $where } = require('../models/UserVerification');

// create nodemailer stuff
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },
});

//Testing success
transporter.verify((error, success) => {
    if(error){
        console.log(error);
    }

    else {
        console.log("Ready for message");
        console.log(success);
    }
});


// Sign Up
router.post('/signup', (req, res) => {

    // let take input from the body of our requests
    let{name, email, password, dateOfBirth} = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    dateOfBirth = dateOfBirth.trim();

    // check any varibles are empty
    if (name == "" || email == "" || password == "" || dateOfBirth == ""){
        // we return json object
        res.json({
            status: "Failed",
            message: "Empty input fields!"
        });

    } 

    // Check name format
    else if (!/^[a-zA-Z ]*$/.test(name)){
        // if the name doesn't match with regex
        // return json object
        res.json ({
            status: "Failed",
            message: "Invalid name entered."
        })
    }

    // Check email format
    else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
        // if the email doesn't match with regex
        // return json object
        res.json ({
            status: "Failed",
            message: "Invalid email entered."
        })
    }

    // Check dateOfBirth format
    else if (!new Date(dateOfBirth).getTime()){
        res.json ({
            status: "Failed",
            message: "Invalid Date of Birth entered."
        })
    }

    // Check password length
    else if (password.length < 8){
        res.json ({
            status: "Failed",
            message: "Password is too short!"
        })
    }

    // If there is no issue of inputs.
    // then check the signup process
    // started to check if user provided email exist or not
    // by using created mongoose model --> models->User.js
    else{
        User.find({email})
        .then(result => {

            if(result.length){

                // a user already exists
                res.json({
                    status: "Failed",
                    message: "User with the provided email already exists!"
                })
            }

            else{

                // if the user doesn't exist, we store the designed database
                // 2. try to create new user

                // 1. passowrd handling
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    const newUser = new User ({
                        name,
                        email,
                        password: hashedPassword,
                        dateOfBirth,

                        // add verfied property
                        verified: false
                    });

                    // 3. Save the new user data
                    newUser.save().then(result => {

                        // handle account verfication
                        sendVerificationEmail(result, res);

                        /*res.json({
                            status: "Success",
                            message: "Signup successfully!",
                            data: result
                        })*/
                        
                    })
                    .catch(err => {
                        res.json({
                            status: "Failed",
                            message: "An error occured while saving user account!"
                        })
    
                    })  

                })
                .catch(err => {
                    res.json({
                        status: "Failed",
                        message: "An error occured while hashing password!"
                    })

                })

            }
            
            
        }).catch(err => {

            console.log(err);
            res.json({

                status: "Failed",
                message: "An Error occured while checking for existing user!"
            });
        });
    }
});


// send verification email
const sendVerificationEmail = ({_id, email}, res) => {

    //url to be used in the email
    const currentUrl = "http://localhost:3000/";

    const uniqueString = uuidv4() + _id;

    // mail options
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify Your Email",
        html: `<p>Verify your email address to complete the signup and login into your account.</p><p>This link<b>expires in 6 hours</b>.</p><p> Press <a href=${
            currentUrl + "user/verify/" + _id + "/" + uniqueString
        }>here</a> to proceed.</p>`,    
    };

    // hash the uniqueString
    const saltRounds = 10;
    bcrypt
        .hash(uniqueString, saltRounds)
        .then((hashedUniqueString) => {

            // set values in userVerification collection
            const newVerification = new UserVerification({

                userId: _id,
                uniqueString: hashedUniqueString,
                createAt: Date.now(),
                expireAt: Date.now() + 21600000,
            });

            newVerification
                .save()
                .then(() => {
                    transporter
                        .sendMail(mailOptions)

                        .then(() => {
                            // email send and verification record saved
                            res.json({
                                status: "Pending..",
                                message: "Verification email sent!"
                            });

                        })

                        .catch((error) => {
                            console.log(error);
                            res.json({
                                status: "Failed",
                                message: "Verification email failed!"
                            });

                        })
                })
                .catch((error) => {
                    console.log(error);

                    res.json({
                        status: "Failed",
                        message: "Couldn't save verification email data!"
                    });
                })
        })

        .catch(() => {
            // we return json object
            res.json({
            status: "Failed",
            message: "An Error occured while hashing email data!"
        });
    })

};


// Sign In
router.post('/signin', (req, res) => {

    // let take input from the body of our requests
    let{email, password} = req.body;
    email = email.trim();
    password = password.trim();

    // check any varibles are emptyz
    if (email == "" || password == "" ){

        // we return json object
        res.json({
            status: "Failed",
            message: "Empty credentials supplied!"
        })
    
    } 

    // check the user is exisit
    else {
        User.find({email})

        .then(data => {

            // if email is exist in the database
            //checked recived data length
            if (data.length) {

                // then compred take password with the hashed password in the DB
                const hashedPassword = data[0].password;
                bcrypt.compare(password, hashedPassword). then (result => {

                if (result) {

                    // the password match
                    res.json({
                        status: "Success!",
                        message: "Signin Successfully!",
                        data: data
                    })
                }

                // if user deatils are not correct
                else {
                    res.json ({
                        status: "Failed",
                        message: "Invalid password entered."
                    })
                }
            }) 
            
            .catch(err => {

                console.log(err);
                res.json({
                    status: "Failed",
                    message: "An Error occured while checking for existing user!"
                })
            })

        }
            
            else {
                res.json ({
                    status: "Failed",
                    message: "Invalid credentials entered."
                })
            }
        })

        .catch(err => {
            res.json ({
                status: "Failed",
                message: "An Error occured while checking for existing user!"

            })
        })

    }
})        
        
    


module.exports = router;