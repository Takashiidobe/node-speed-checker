//dependencies
//uses node-cron to schedule tasks
const cron = require('node-cron');
//fs to write the file
const fs = require('fs');
//express allows us to use a back-end
const express = require('express');
//allows us to e-mail
const nodemailer = require('nodemailer');
//import for speedtest
const speedTest = require('speedtest-net');
//file which contains credentials for use
const login = require('./login.json');
//which port you decide to run on (or other domain)
const port = 4000;

//starts the express app
app = express();

//speedtest will stop at 5 seconds
const test = speedTest({maxTime: 5000});

//create mail transporter with userinformation
//fill in your own information in your own login.json file
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: login.username,
    pass: login.password
  }
});

//wrapped the function
const runTest = () => {
  //runs the speedtest
test.on('data', data => {
  //writes a file with the information
  fs.writeFile('speedtest.txt', JSON.stringify(data, null, 2), (err) => {
    //changes the file into strings
    const parsedData = JSON.stringify(data);
    //writes a message saving the file write worked
    console.log('File has been saved');
    //passes a callback function with the parsedData
    sendMail(parsedData);
    //writes the data to the console
    console.dir(data);
  });
});

//logs the error message if there is an error
test.on('error', err => {
  console.error(err);
});
}

//uses nodecron to send out the stringified information
const sendMail = (parsedData) => {

// runs at the start of every hour
cron.schedule('0 * * * *', () => {
  // lets you know when the job is running through command prompt
  console.log('-----------------');
  console.log('Running a Cron job');

  //the options to send a message
  let mailOptions = {
    from: `${login.username}`,
    to: `${login.target}`,
    subject: `About your spectrum internet connection`,
    text: `Here is your connection information ${parsedData}`
  };
  //tries to send the message here
  transporter.sendMail(mailOptions, (err, info) => {
    if (!err) {
      //if successful, sends message!
      console.log('Email successfully sent!');
    } else {
      //else logs the error
      throw err;
    }
  });
});
}

//sets up the site on port 4000
app.get('/', (req, res) => {
  //lets you download the results if you point 
  fs.readFile('speedtest.txt', (err, data) => {
    if (err) throw err;
    res.send(data);
  });
});

//listens on the port of your choice
app.listen(port);

//run the whole script
runTest();

