import axios from "axios";

const url = "http://localhost:8080/api/users";


export const createUser = (user) => axios.post(url, user);

export const getallusers = () => axios.get(url);

export const getUsersbyId= (id) => axios.get(url + "/" + id);

export const updateUsers= (id, user) => axios.put(url + "/" + id, user);

export const deleteusers= (id) => axios.get(url + "/" + id);


