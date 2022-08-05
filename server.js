console.log("Server Side....")

// Give acess to the our mongodb database
require('./config/db');

const express = require("express")
const App = express()
const port = 3000;

const UserRouter = require('./api/User');


// for accepting post form data
const bodyParser = require('express').json;
App.use(bodyParser());

// for direct out application  to use the router which is created.
App.use('/user', UserRouter);


App.listen(port, () => {
    console.log(`Server running on port ${port}`);
})