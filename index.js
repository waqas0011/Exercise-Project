const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require("crypto")
const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler")
const bcrypt = require('bcryptjs')
const validator = require('validator')
const app = express();
const port = 8081;
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken")
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/Tasks', { useNewUrlParser: true }),
    console.log('mongodb connected');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json())
const JWT="abcd124";
const generateToken = (id) => {
    console.log(process.env.JWT);
    return jwt.sign({ id }, process.env.JWT, {
        expiresIn: "30d",
    });
}
const userSchema = {
    firstName: { type: String, required: [true, 'please enter your first name'] },
    lastName: { type: String, required: [true] },
    email: { type: String, unique: true, required: [true] },
    password: { type: String, required: [true] },


}
const user = mongoose.model('User', userSchema);
app.post("/adduser", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const encryptedPassword = await bcrypt.hash(password, 10);
  try {
    const User = await user.findOne({ email });

    if (User) {
      return res.json({ error: "User Exists" });
    }
    await user.create({
      firstName,
      lastName,
      email,
      password: encryptedPassword,
    });
    res.send({ status: "ok" });
  } catch (error) {
    res.send({ status: "error" });
  }
});


// user login..
app.post("/loginuser", async (req, res) => {
    const { email, password } = req.body;
  
    const User = await user.findOne({ email });
    if (!User) {
      return res.json({ error: "User Not found" });
    }
    if (await bcrypt.compare(password, User.password)) {
      const token = jwt.sign({ email: User.email }, JWT, {
        expiresIn: "10d",
      });
  
      if (res.status(201)) {
        return res.json({ status: "ok", data: token });
      } else {
        return res.json({ error: "error" });
      }
    }
    res.json({ status: "error", error: "InvAlid Password" });
  });


  // user profile data

  app.post("/userData", async (req, res) => {
    const { token } = req.body;
    try {
      const user = jwt.verify(token, JWT, (err, res) => {
        if (err) {
          return "token expired";
        }
        return res;
      });
      console.log(user);
      if (user == "token expired") {
        return res.send({ status: "error", data: "token expired" });
      }
  
      const useremail = user.email;
      user.findOne({ email: useremail })
        .then((data) => {
          res.send({ status: "ok", data: data });
        })
        .catch((error) => {
          res.send({ status: "error", data: error });
        });
    } catch (error) {}
  });


  //forget password
app.post("/forget", async (req, res) => {
    const { email } = req.body;
    try {
      const User = await user.findOne({ email });
      if (!User) {
        return res.json({ status: "User Not Exists!!" });
      }
      const secret = JWT + user.password;
      const token = jwt.sign({ email: User.email, id: user._id }, secret, {
        expiresIn: "5s",
      });
      const link = `http://localhost:8081/forget/${user._id}/${token}`;
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "waqaskh@gmail.com",
          pass: "rmdklolcsmswvyfw",
        },
      });
  
      var mailOptions = {
        from: "waqaskhaliw@gmail.com",
        to: "waqaskhaliqw@gmail.com",
        subject: "Password Reset",
        text: link,
      };
  
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      console.log(link);
    } catch (error) {}
  });





app.listen(port, (req, res) => {
    console.log(' Listening on port: ${8081}.... ');
});