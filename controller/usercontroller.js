
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../model/userModel");
const Reset = require("../model/passwordReset");
const dotenv = require("dotenv").config();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const { GoogleAuth, OAuth2Client } = require("google-auth-library");
const { response } = require("express");
const client = new OAuth2Client(
	"894155198746-3vu7s6k2ii7db2c3m4cqmt7mibjkmptg.apps.googleusercontent.com",
);

//@desc Register Users
//@route POST/api/users
//@access PUBLIC
var transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "arxlan62@gmail.com",
		pass: "lheyvubtkgabmhaa",
	},
	tls: {
		rejectUnauthorized: false,
	},
});
const registerUser = asyncHandler(async (req, res) => {
	const { name, email, password, phone, city } = req.body;

	if (!name || !email || !password || !phone || !city) {
		res.status(400);
		throw new Error("Please add all fields");
	}
	// Check if user Exist
	const userExists = await User.findOne({ email });
	if (userExists) {
		res.status(400);
		throw new Error("User Already Registered");
	}
	//Hash password
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	//Create User
	const user = await User.create({
		name,
		email,
		password: hashedPassword,
		phone,
		city,
		emailToken: crypto.randomBytes(64).toString("hex"),
		isVerified: false,
	});
	// Send Verification Email To User
	var mailOptions = {
		from: '"verify your email" <arsltech337@gmail.com>',
		to: user.email,
		subject: "Labortory System -verify your email",
		html: `<h2>${user.name.toUpperCase()}! Thanks for registering on our site</h2>
  <h4>Please Verify your email to continue...</h4>
  <a href="http://${req.headers.host}/api/users/verify-email?token=${user.emailToken}">Verify Your Email</a>`,
	};
	console.log(req.headers.host);
	//Sending Email
	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(error);
		} else {
			console.log("Verification email is send to your email");
		}
	});
	if (user) {
		res.status(201).json({
			_id: user.id,
			name: user.name,
			email: user.email,
			token: generateToken(user._id),
		});
	} else {
		res.status(400);
		throw new Error("Invalid User data");
	}
});
// Verify Email And Route to Login
const verifyEmail = async (req, res) => {
	try {
		const token = req.query.token;
		const user = await User.findOne({ emailToken: token });
		if (user) {
			user.emailToken = null;
			user.isVerified = true;
			await user.save();
			res.json("User is Verified");
		} else {
			console.log("Email is not verified");
		}
	} catch (error) {
		console.log(error);
	}
};
//@desc Login Users
//@route POST/api/users
//@access PUBLIC

const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	if (
		user &&
		(await bcrypt.compare(password, user.password)) &&
		user.isVerified
	) {
		res.json({
			_id: user.id,
			name: user.name,
			email: user.email,
			token: generateToken(user._id),
		});
	} else {
		res.status(400);
		throw new Error("Please Check Your Email.Are you verified?");
	}
});
const forgotPassword = async (req, res) => {
	const { email, redirectUrl } = req.body;
	//Check if user exist
	User.find({ email }).then((data) => {
		if (data.length) {
			//user exists
			//user is verified
			if (!data[0].isVerified) {
				res.json({
					status: "Failed",
					message: "Email hasn't been verified yet .Check your Inbox",
				});
			} else {
				sendResetEmail(data[0], redirectUrl, res);
			}
		}
	});
};
//@desc Me Users
//@route POST/api/users
//@access PUBLIC

const getMe = asyncHandler(async (req, res) => {
	const { _id, name, email } = await User.findById(req.user.id);
	res.status(200).json({
		id: _id,
		name,
		email,
	});
});

//Generate Token
const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SCRT, {
		expiresIn: "30d",
	});
};
// send password reset email
const sendResetEmail = ({ _id, email }, redirectUrl, res) => {
	const resetString = uuidv4() + _id;
	//First clear all the reset request
	Reset.deleteMany({ userId: _id })
		.then((result) => {
			//Mail options
			var mailOptions = {
				from: "<arsltech337@gmail.com>",
				to: email,
				subject: "Password Reset",
				html: `
  <h4> We heard that you loss the password.Dont worry use the link below to reset it.This link expires in 60 minutes</h4>
<p>Press<a href=${
					redirectUrl + "/" + _id + "/" + resetString
				}>here</a> to proceed `,
			};
			const saltRounds = 10;
			bcrypt
				.hash(resetString, saltRounds)
				.then((hashedResetString) => {
					//Set values
					const newPasswordReset = new Reset({
						userId: _id,
						resetString: hashedResetString,
						createdAt: Date.now(),
						expiresAt: Date.now() + 3600000,
					});
					newPasswordReset
						.save()
						.then(() => {
							transporter
								.sendMail(mailOptions)
								.then(() => {
									res.json({
										status: "PENDING",
										message:
											"PASSWORD RESET EMAIL SEND SUCCEESSFULY",
									});
								})
								.catch((error) => {
									console.log("Password Reset  Email Failed");
								});
						})
						.catch((error) => {
							console.log(error);
						});
				})
				.catch((error) => {
					console.log(error);
					res.json({
						status: "Failed",
						message:
							"An error occured while hashing the password reset",
					});
				});
		})
		.catch((error) => {
			console.log(error);
			res.json({
				status: "FAILED",
				message: "Clearing existing password reset records failed",
			});
		});
};
const passwordReset = async (req, res) => {
	let { userId, resetString, newPassword } = req.body;
	Reset.find({ userId })
		.then((result) => {
			if (result.length > 0) {
				// Password Reset record exist
				const { expiresAt } = result[0];
				const hashedResetString = result[0].resetString;
				if (expiresAt < Date.now()) {
					Reset.deleteOne({ userId })
						.then(() =>
							res.json({
								status: "FAILED",
								message: "Password Reset Link is expired.",
							}),
						)
						.catch((error) => {
							//deletion failed
							console.log(error);
							res.json({
								status: "FAILED",
								message: "CLEARING PASSWORD RECORD FAILED",
							});
						});
				} else {
					//valid reset record exists so we validate
					// First compare the hashed reset string
					bcrypt
						.compare(resetString, hashedResetString)
						.then((result) => {
							if (result) {
								const saltRounds = 10;
								bcrypt
									.hash(newPassword, saltRounds)
									.then((hashedNewPassword) => {
										//update user password
										User.updateOne(
											{ _id: userId },
											{ password: hashedNewPassword },
										)
											.then(() => {
												Reset.deleteOne({ userId })
													.then(() => {
														//both user record and reset record updated
														res.json({
															status: "SUCCESS",
															message:
																"Password has been reset successfuly",
														});
													})
													.catch((error) => {
														console.log(error);
														res.json({
															status: "Failed",
															message:
																"An error occured",
														});
													});
											})
											.catch((error) => {
												console.log(error);
												res.json({
													status: "FAILED",
													message:
														"Updating user password failed",
												});
											});
									})
									.catch((error) => {
										console.log(error);
										res.json({
											status: "Failed",
											message:
												"An error occured while hashing the password",
										});
									});
							} else {
								res.json({
									status: "Failed",
									message:
										"Invalid password reset details passed",
								});
							}
						})
						.catch((error) => {
							console.log(error);
							res.json({
								status: "Failed",
								message:
									"Comparing Password Reset String Failed",
							});
						});
				}
			} else {
				//Password Reset Request not found
				res.json({
					status: "FAILED",
					message: "Password reset request not found",
				});
			}
		})
		.catch((error) => {
			console.log(error);
			res.json({
				status: "Failed",
				message: "Checking for actually password reset fails",
			});
		});
};

 const googleLogin = (req, res) => {
	console.log("Arslan Akmal");
	const { tokenId } = req.body;

	client.verifyIdToken({
		idToken: tokenId,
		audience:
			"894155198746-3vu7s6k2ii7db2c3m4cqmt7mibjkmptg.apps.googleusercontent.com",
	});
	const { email_verfied, name, email } = response.payload;
	console.log(response.payload);
	if (email_verfied) {
		User.findOne(email).exec((err, user) => {
			if (err) {
				return res.status(400).json({
					error: "This user doesn't exist, Signup First",
				});
			} else {
				if (user) {
					const token = jwt.sign(
						{ _id: user._id },
						process.env.JWT_SIGNIN_KEY,
						{ expiresIn: "7d" },
					);
					const { _id, name, email } = user;
					res.json({
						token,
						user: { _id, name, email },
					});
				} else {
					let password = email + process.env.JWT_SIGNIN_KEY;

					let newUser = new User({ name, email, password });
					newUser.save((err, data) => {
						if (err) {
							return res.status(400).json({
								error: "Something Wrong....",
							});
						}
						const token = jwt.sign(
							{ _id: data._id },
							process.env.JWT_SIGNIN_KEY,
							{ expiresIn: "7d" },
						);
						const { _id, name, email } = newUser;
						res.json({
							token,
							user: { _id, name, email },
						});
					});
				}
			}
		});
	}
};
//@desc Get All Goals
//@route GET/api/allgoals
//@access PUBLIC

const getAllUsers = asyncHandler(async (req, res) => {
	const user = await User.find();

	res.status(200).json(user);
});

module.exports = {
	registerUser,
	loginUser,
	getMe,
	verifyEmail,
	forgotPassword,
	passwordReset,
	googleLogin,
	getAllUsers,
};
 