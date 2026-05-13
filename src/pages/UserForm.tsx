import { useState } from 'react'
import {createUser} from "../services/userService.js";

const UserForm = () => {

    const[username, setUsername] = useState();
    const[email, setEmail] = useState();
    const[password, setPassword] = useState();

    function handleFormSubmit(e){
       e.preventDefault();

       const user = {username,email,password}

       createUser(user).then((response) => {
        console.log("Added to Database");
       })
       .catch((error) => {
        console.log(error);
       });

     
    }

  return (
    <div>
      <h1 className= "text-2xl mb-6">Add User</h1>


      <form onSubmit={handleFormSubmit} className="flex flex-col">
        <label>Username</label>
        <input type="text" 
        value={username} 
        onChange = {(e) => setUsername(e.target.value)}
        className="border border-black"/>

        <label>Email</label>
        <input type="text" value={email} 
        onChange = {(e) => setEmail(e.target.value)}
        className="border border-black"/>

        <label>Password</label>
        <input type="password" value={password} 
        onChange = {(e) => setPassword(e.target.value)}
        className="border border-black"/>
    

        <input type="submit" value="submit" className="bg-black text-white mt-8 cursor-pointer"/>
      </form>
    </div>
  )
}

export default UserForm
