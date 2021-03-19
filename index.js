
var db = require('./db');
const express = require('express')

var cors = require('cors')
var bodyParser = require('body-parser')
const app = express()
const port = 3200
var mailer = require("nodemailer");
var Crypto = require('crypto')
var moment = require('moment')
var bcrypt = require("bcrypt")
var bodyParser = require('body-parser');
app.use(cors())
var corsOptions = {
    origin: 'http://localhost:3000'
  }
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/user/login', (req, res) => {
    db.conn.query(`SELECT * FROM users where EmailID='${req.body.email}' and Pass='${req.body.pass}'`, function (err, queryResponse) {
        if (err) {
            res.send(err.code)} else {
                res.send(queryResponse)
            };
        });
})

app.post('/user/signup', (req, res) => {
    var obj = req.body;
    if(obj.dob && obj.email && obj.firstname && obj.lastname && obj.pass && obj.username && obj.usertype){
    db.conn.query(`INSERT INTO users 
    (DOB, EmailID, First_Name, Last_Name, Pass, UserID, UserType) VALUES 
    ('${obj.dob}','${obj.email}','${obj.firstname}','${obj.lastname}','${obj.pass}','${obj.username}','${obj.usertype}' );`, function (err, queryResponse) {
        if (err) { res.send(err.code);} else {
        res.send({user : obj.firstname + ' ' + obj.lastname})
        }});
    } else {
        res.send('Missing Parameters!')
    }
})


app.post('/user/forgotpassword', function(req, res){
    var data = {
        
      "EmailID":req.body.email,
        }
     console.log(req.body.email); 
     console.log("DB")  
     db.conn.query(`SELECT * FROM users where EmailID='${req.body.email}'`,
     data.Email, function(error,results,fields){
        console.log(req)
        if(error){
            console.log(error)
            res.send({
                "code":400,
            "Status":"error ocurred"
            })
          }
        else if(results.length == 0){
            console.log("no results")
            
            res.send({
                "code": 210,
                "Status" : "EmailID Not recognized"
            })
        }
        else{
            const crypto=require('crypto');
            const token = crypto.randomBytes(30).toString('hex')
            var resetPasswordTokenExpires = new Date()
            console.log(db.conn.escape(resetPasswordTokenExpires))
            var t = req.body.email
            var sql = `Update users SET resetPasswordToken = '${req.body.resetPasswordToken}', resetPasswordTokenExpires = '${resetPasswordTokenExpires}' Where EmailID = '${req.body.email}'`
            db.conn.query(sql,[token,resetPasswordTokenExpires,t],function(error,result,fields){
                if(error){
                    console.log(error)
                    res.send({
                        "code":400,
                    "failed":"error ocurred"
                    })
                }
                else{
                    var nodemailer = require('nodemailer');
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                          user: 'startwell2021@gmail.com',
                          pass: 'Welcome@123'
                        }
                    });
                      var mailOptions = {
                        from: 'startwell2021@gmail.com',
                        to: req.body.email,
                        subject: 'Link To Reset Password',
                        text:'You are recieving this email because you have requested to reset the password.\n'
                        +'Please click the below link\n\n'+
                        'http://localhost:3000/ResetPassword/'







                      };
                      transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('Email sent: ' + info.response);
                        }
                      });


                      res.send({
                
                        "code":200,
                            "success":"Email Sent Successfully"
                    });

                }
            })
            
        }
     })

})


app.get('/user/resetpassword', cors(corsOptions),function(req,res){
    console.log("In re-setpassword",req.query)
    var data = {
        "resetPasswordToken" : req.query.resetPasswordToken,
    }
    console.log(data.resetPasswordToken)
    db.conn.query(`SELECT * from users where resetPasswordToken = '${req.body.resetPasswordToken}'`,
    data.resetPasswordToken,function(error,results,fields){
        var d = new Date()
        console.log("token expires date value",d,"  ",new Date(results[0].resetPasswordTokenExpires))
        console.log("time value",d - new Date(results[0].resetPasswordTokenExpires))
        if(error){
            res.send({
                "code":400,
                "Status":"error occured"
            })
        }
        else if(d - new Date(results[0].resetPasswordTokenExpires)<= 36000000){
            //res.setHeader("Access-Control-Allow-Origin","*")
            //res.redirect('http://localhost:3000/ResetPassword')
            res.send({

                "code" : 200,
                "Status":"reset link OK",
                results
            })
            
        }
        else{
            res.send({
                "code" : 210,
                "Status" : "reset link expired"
            })
        }
    })

})

app.put('/user/updatepassword', function(req,res)
{
    var data = {
       
      "EmailID":req.body.email,
       "Pass":req.body.password
    
        }
      const SALT_ROUND = 12
      let hashedPassword = bcrypt.hashSync(data.Pass,SALT_ROUND)
        db.conn.query(`Update users SET Pass = '${req.body.password}' Where EmailID ='${req.body.email}'`,
        [hashedPassword,data.EmailID],function(error,results,fields){
            console.log(data.EmailID)
            console.log(hashedPassword)
            console.log(req.body.password)
            if(error){
                console.log(error);
                res.send({
                    "code":400,
                    "Status":"error occured",
                })
            }
            else{
                res.send({
                    "code":200,
                    "Status" : "Password updated successfully",
                })
            }
        })

})



app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})


