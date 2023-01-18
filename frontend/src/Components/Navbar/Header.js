 import React from 'react';
 import Nav from "react-bootstrap/Nav";
 import Container from "react-bootstrap/Container";
 import Navbar from "react-bootstrap/Navbar";
 
 
 
 export default function Header() {
   return (
    <>
    <Navbar bg="dark" variant="dark">
   <Container>
     <Navbar.Brand href="#home">User Registration</Navbar.Brand>
     <Nav className="me-auto">
       <Nav.Link href="#home">Home</Nav.Link>
     </Nav>
     <Nav className="me-auto">
       <Nav.Link href="#home">About Us</Nav.Link>
     </Nav>
     <Nav className="me-auto">
       <Nav.Link href="#home">Contact Us</Nav.Link>
     </Nav>
   </Container>
 </Navbar>
</>
   )
 }
 
