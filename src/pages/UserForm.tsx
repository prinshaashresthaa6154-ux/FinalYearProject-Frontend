import axios from "axios";
import { useState, type FormEvent } from "react";
import { createUser } from "../services/UserService.js";

type ValidationErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export default function UserForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (username.trim().length < 2) {
      setErrorMessage("Username must contain at least 2 characters.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must contain at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createUser({ username: username.trim(), email: email.trim(), password });
      setUsername("");
      setEmail("");
      setPassword("");
      setSuccessMessage("User created successfully.");
    } catch (error) {
      const errorData = axios.isAxiosError<ValidationErrorResponse>(error)
        ? error.response?.data
        : undefined;
      const validationErrors = errorData?.data
        ? Object.values(errorData.data).join(" ")
        : "";
      setErrorMessage(validationErrors || errorData?.message || "Unable to create user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Add User</h1>
      <p className="mt-1 text-sm text-gray-500">Create a user account with the required details.</p>

      <form onSubmit={handleFormSubmit} className="mt-7 space-y-5 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <label htmlFor="username" className="mb-2 block text-sm font-medium">Username</label>
          <input id="username" type="text" value={username} onChange={(event) => setUsername(event.target.value)} required minLength={2} maxLength={150} autoComplete="name" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-700" />
        </div>
        <div>
          <label htmlFor="user-email" className="mb-2 block text-sm font-medium">Email</label>
          <input id="user-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-700" />
        </div>
        <div>
          <label htmlFor="user-password" className="mb-2 block text-sm font-medium">Password</label>
          <input id="user-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-700" />
        </div>

        {successMessage && <p role="status" className="text-sm text-green-700">{successMessage}</p>}
        {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}

        <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-red-700 px-4 py-3 font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? "Creating user..." : "Create user"}
        </button>
      </form>
    </section>
  );
}
