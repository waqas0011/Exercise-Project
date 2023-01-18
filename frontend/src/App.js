import 'bootstrap/dist/css/bootstrap.min.css';
 import './App.css';
 import Header from './Components/Navbar/Header';
 import Register from './Components/Register';
 import { Routes ,Route} from 'react-router-dom';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard'
import Forget from './Components/Forget';
import { Toaster } from 'react-hot-toast';
 
function App() {
  const isloggedIn=window.localStorage.getItem('loggedIn')
  return (
    <>
    <Toaster/>
   <Header/>
   <Routes>
  <Route path='/' element={<Register/>}/>
  <Route path='/login' element={isloggedIn==='true'? <Dashboard/>:<Login/>}/>
  <Route path='/dashboard' element={<Dashboard/>}/>
  <Route path='/forget' element={<Forget/>}/>
   </Routes>   
   </> 
  );
}

export default App;
