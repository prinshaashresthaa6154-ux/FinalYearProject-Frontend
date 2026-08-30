import { useEffect, useState } from "react";
import Pagination from "../components/Pagination";
import { getallusers, type User } from "../services/UserService.js";

const PAGE_SIZE = 10;

export default function ListUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadUsers = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getallusers();
      setUsers(response.data);
      setPage(1);
    } catch {
      setErrorMessage("Unable to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const visibleUsers = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Users</h1>
        <p className="mt-1 text-sm text-gray-500">Registered Nepal Yatra accounts.</p>
      </div>

      {isLoading && (
        <div role="status" className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading users...
        </div>
      )}

      {!isLoading && errorMessage && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">{errorMessage}</p>
          <button type="button" onClick={() => void loadUsers()} className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white">
            Try again
          </button>
        </div>
      )}

      {!isLoading && !errorMessage && users.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="font-semibold">No users found</h2>
          <p className="mt-1 text-sm text-gray-500">User accounts will appear here when available.</p>
        </div>
      )}

      {!isLoading && !errorMessage && users.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Username</th>
                  <th className="px-5 py-3">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-5 py-4 text-gray-500">{user.id}</td>
                    <td className="px-5 py-4 font-medium">{user.username}</td>
                    <td className="px-5 py-4 text-gray-600">{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  );
}
