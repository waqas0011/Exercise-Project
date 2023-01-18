import React from 'react'
import { useState } from 'react'
import Form from 'react-bootstrap/Form'

import Button from 'react-bootstrap/Button';
export default function Forget() {
    const [email, setEmail] = useState('');


    const forget=(e)=>{
        e.preventDefault()
        console.log( email );
     setEmail(" ")
        
        };
    
  return (
    <div className="container mt-4" >
    <section className='d-flex justify-content-between'>
        <div className="left_data" style={{ width: "100%" }}>
            <h3>Forgoten password</h3>
            <Form  onSubmit={forget}>
                <Form.Group className="mb-3  col-lg-4" name='lastName' controlId="formBasicEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" name='email' onChange={(e)=>setEmail(e.target.value)}  placeholder="Enter your email" />
                </Form.Group>
                <Button variant="primary" type="submit">
                                Submit
                            </Button>
              
            </Form>
           

        </div>

    </section>
</div> 

  )
}