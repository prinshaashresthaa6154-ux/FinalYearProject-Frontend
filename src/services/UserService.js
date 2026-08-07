import api from "../api/axios";

const url = "/api/users";


export const createUser = (user) => api.post(url, user);

export const getallusers = () => api.get(url);

export const getUsersbyId= (id) => api.get(url + "/" + id);

export const updateUsers= (id, user) => api.put(url + "/" + id, user);

export const deleteusers= (id) => api.delete(url + "/" + id);

