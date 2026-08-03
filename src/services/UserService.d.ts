import type { AxiosPromise } from "axios";

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
}

export type NewUser = Omit<User, "id">;

export function createUser(user: NewUser): AxiosPromise<User>;
export function getallusers(): AxiosPromise<User[]>;
export function getUsersbyId(id: number): AxiosPromise<User>;
export function updateUsers(id: number, user: NewUser): AxiosPromise<User>;
export function deleteusers(id: number): AxiosPromise<User>;
