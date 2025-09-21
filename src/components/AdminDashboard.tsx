import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

interface AllowedUser {
  id: string;
  email: string;
  role: string;
}

const AdminDashboard: React.FC = () => {
  const [newEmail, setNewEmail] = useState("");
  const [allowedUsers, setAllowedUsers] = useState<AllowedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllowedUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, "allowedUsers"));
      const users: AllowedUser[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, email: doc.id, role: doc.data().role });
      });
      setAllowedUsers(users);
    } catch (err: any) {
      setError("Failed to fetch allowed users: " + err.message);
      console.error("Error fetching allowed users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllowedUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    try {
      // Use email as document ID for easy lookup
      await addDoc(collection(db, "allowedUsers"), { email: newEmail, role: "member" });
      setNewEmail("");
      fetchAllowedUsers(); // Refresh the list
    } catch (err: any) {
      setError("Failed to add user: " + err.message);
      console.error("Error adding user:", err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, "allowedUsers", id));
      fetchAllowedUsers(); // Refresh the list
    } catch (err: any) {
      setError("Failed to delete user: " + err.message);
      console.error("Error deleting user:", err);
    }
  };

  if (loading) {
    return <div className="p-4 text-white">Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-gray-800 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add New Allowed User</h2>
        <form onSubmit={handleAddUser} className="flex space-x-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter user email"
            className="flex-grow p-2 rounded bg-gray-700 border border-gray-600 text-white"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Add User
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Current Allowed Users</h2>
        {allowedUsers.length === 0 ? (
          <p>No allowed users found.</p>
        ) : (
          <ul className="space-y-2">
            {allowedUsers.map((user) => (
              <li
                key={user.id}
                className="flex justify-between items-center p-3 bg-gray-700 rounded border border-gray-600"
              >
                <span>{user.email}</span>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
