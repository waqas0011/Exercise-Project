
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';
import { useState } from 'react'
// import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function Register() {
    const [firstName, setfirstName] = useState('');
    const [lastName, setlastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setpassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
   
    const register = async(e)=>{
        e.preventDefault()
        console.log("Data",firstName, lastName,email,password);
    
        if(!firstName || !email || !password || !confirmPassword) {
           
            return  toast.error("Please fill all fields");
           
        }
        if(password.length < 8) {
            return toast.error("Password should be at least 8 characters!")
        }
        if(!validateEmail(email)) {
            return toast.error("Please enter valid email")
        }

        if(password !== confirmPassword) {
            return toast.error("Password should be same as confirm password")
        }

         axios.post('http://localhost:8081/adduser', {
            firstName, lastName, email, password,
            method:'POST',
            crossDomain:true,
            headers:{
                "content-type":"application/json",
                Accept:"application/json",
            },
            data:JSON.stringify({
                firstName,
                lastName,
                email,
                password
            })
        })
        
        .then(function (response) {
            const data = response.data;
            console.log(data);
           
            if(data.status) {
                toast.success(data.message)
            }
            else {
                toast.error(data.message)
            }
        })
        .catch(function (error) {
            console.log(error);
        });
        // console.log(data);
    }
    const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };
     

    return (
        <>
            <div className="container mt-4">
                <section className='d-flex justify-content-between'>

                    <div className="left_data" style={{ width: "100%" }}>
                        <h3>Sign Up!</h3>
                        <Form   >
                            <Form.Group className="mb-3 col-lg-4" controlId="formBasicfName">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control type="text" name='firstName' value={firstName} onChange={(e)=> setfirstName(e.target.value)} placeholder="First Name" />
                            </Form.Group>
                            <Form.Group className="mb-3 col-lg-4" controlId="formBasiclName">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control type="text" name='lastName'value={lastName} onChange={(e) => setlastName(e.target.value)} placeholder="Last Name" />
                            </Form.Group>

                            <Form.Group className="mb-3  col-lg-4"   controlId="formBasicEmail">
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" name='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
                            </Form.Group>
                            <Form.Group className="mb-3  col-lg-4" controlId="formBasiPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" name='password' value={password} onChange={(e) => setpassword(e.target.value)} placeholder="Password" />
                            </Form.Group>
                            <Form.Group className="mb-3  col-lg-4" controlId="formBasicPassword">
                                <Form.Label>confirmPassword</Form.Label>
                                <Form.Control className='mt-2' type="password" name='confirmPassword' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" />
                            </Form.Group>
                            <Button variant="primary" onClick={register} type="submit">
                                Submit
                            </Button>
                        </Form>
                        <p className='mt-3'>Already have an Account <span><Link to="/login">Sign in</Link></span></p>

                    </div>

                </section>
            </div>

        </>
    )
}
