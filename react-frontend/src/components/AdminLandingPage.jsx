import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLandingPage = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/api/users/all")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("Expected an array of users but got:", data);
          setUsers([]);
        }
      })
      .catch(err => {
        console.error("❌ Failed to fetch users", err);
        setUsers([]);
      });
  }, []);

  const deleteUser = async (email) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/users/${email}`, { method: "DELETE" });
      if (res.ok) setUsers(users.filter(user => user.email !== email));
      else throw new Error("Failed to delete user");
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-purple-700">🛠️ Admin Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem("email");
            localStorage.removeItem("role");
            navigate("/");
          }}
          className="text-sm text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>

      {/* Users Section */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">👥 Users</h2>
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email} className="border-t">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2">
                    {u.role !== "ADMIN" && (
                      <button
                        onClick={() => deleteUser(u.email)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminLandingPage;
