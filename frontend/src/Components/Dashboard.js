import {useState} from "react"
 
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

 

export default function Dashboard () {
	const [firstName, setfirstName] = useState('');
    const [lastName, setlastName] = useState('');
    const [email, setEmail] = useState('');
 
   const  profile =()=>{
	console.log("Data",firstName, lastName,email);
	setfirstName("");
	setlastName("");
	setEmail("")
	fetch("http://localhost:8081/userData", {
		method: "POST",
		crossDomain: true,
		headers: {
		  "Content-Type": "application/json",
		  Accept: "application/json",
		  "Access-Control-Allow-Origin": "*",
		},
		body: JSON.stringify({
		  token: window.localStorage.getItem("token"),
		}),
	  })
	  .then((res) => res.json())
      .then((data) => {
        console.log(data, "userData");
		this.setState({ userData: data.data });
    
      });
  }
const logout=()=>{
	window.localStorage.clear();
	window.location.href="./login"

}
    return (
		<>
		<div className="container mt-4">
			<section className='d-flex justify-content-between'>

				<div className="left_data" style={{ width: "100%" }}>
					<h1>User Details</h1>
					<Form >
						<Form.Group className="mb-3 col-lg-4" controlId="formBasicfName">
							<Form.Label><h4>First Name</h4></Form.Label>
							<Form.Control type="text"  value={firstName} />
						</Form.Group>
						<Form.Group className="mb-3 col-lg-4" controlId="formBasiclName">
							<Form.Label><h4>Last Name</h4></Form.Label>
							<Form.Control type="text" name='lastName'value={lastName}   />
						</Form.Group>

						<Form.Group className="mb-3  col-lg-4"   controlId="formBasicEmail">
							<Form.Label><h4>Email</h4></Form.Label>
							<Form.Control type="email" name='email' value={email}  />
						</Form.Group>
						</Form>
						<Button variant="primary"    type="submit" onClick={logout}>
                                Logout
                            </Button>
				</div>

			</section>
		</div>

	</>
    );
  }
 
 