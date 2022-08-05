const express = require('express');
const router = express.Router();

// mongodb user model
const User = require('../models/User');

// password handler
const bcrypt = require('bcrypt');

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
                        dateOfBirth
                    });

                    // 3. Save the new user data
                    newUser.save().then(result => {

                        res.json({
                            status: "Success",
                            message: "Signup successfully!",
                            data: result
                        })
                        
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
            })
        })
    }
})


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