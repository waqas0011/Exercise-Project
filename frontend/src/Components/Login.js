 
import React, { useState, } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {toast} from "react-hot-toast"
import { Link } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
function Login() {
    // const nevigate=useNavigate();
    const [email, setEmail] = useState('');
    const [password, setpassword] = useState('');

        const  login = (e) => {
            e.preventDefault();
            const validateEmail = (email) => {
                return String(email)
                  .toLowerCase()
                  .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                  );
              };
          
            console.log( email, password);
            if(!email || !password ) {
           
                return  toast.error("Please fill all fields");
               
            }
            if(password.length < 8) {
                return toast.error("Password should be at least 8 characters!")
            }
            if(!validateEmail(email)) {
                return toast.error("Please enter valid email")
            }
    
            
            fetch("http://localhost:8081/loginuser", {
              method: "POST",
              crossDomain: true,
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Access-Control-Allow-Origin": "*",
              },
              body: JSON.stringify({
             
                email,
                password,
              }),
            })

            .then((res) => res.json())
            .then((data) => {
              console.log(data);
              if (data.status === "ok") {
                alert("login successful");
                window.localStorage.setItem("token", data.data);
                window.localStorage.setItem("loggedIn", true);
                window.location.href = "./dashboard";
              }
            });
            
               
          }
    
    return (
        <>
            <div className="container mt-4" >
                <section className='d-flex justify-content-between'>

                    <div className="left_data" style={{ width: "100%" }}>
                        <h3>Login In</h3>
                        <Form  >


                            <Form.Group className="mb-3  col-lg-4" name='lastName' controlId="formBasicEmail">
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" name='email' onChange={(e)=>setEmail(e.target.value)}  placeholder="Enter your email" />
                            </Form.Group>
                            <Form.Group className="mb-3  col-lg-4" controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" name='password' onChange={(e)=>setpassword(e.target.value)} placeholder="Password" />

                            </Form.Group>
                            <p> <Link to={'/forget'} >Forgot Password</Link> </p>
                            <Button variant="primary"    type="submit" onClick={login}>
                                Submit
                            </Button>
                        </Form>
                        <p className='mt-3'>create a new account <span><Link to={"/"}>Sign up</Link></span></p>
                    </div>
                </section>
            </div>
        </>
    )
}
export default Login;