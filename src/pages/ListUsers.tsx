import { useEffect, useState } from "react";
import {getallusers} from "../services/UserService.js";
import type { User } from "../services/UserService.js";


const ListUsers = () => {

    const [user, setUser] = useState<User[]>([]);
     
    useEffect(() => {
        getUsers();
    }, []);

    function getUsers(){
        getallusers().then((response) =>{
            setUser(response.data);
        })
        .catch((error) =>{
            console.log(error);
    
        });

    }

  return (
    <div>
      <h1>List of Users</h1>
      <table>
        <thead>
            <tr>
            <th>Id</th>
            <th>Username</th>
            <th>Email</th>
            <th>Password</th>
            </tr>
        </thead>
        <tbody>
            {user.map((user) =>(
                <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.password}</td>
                </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default ListUsers
