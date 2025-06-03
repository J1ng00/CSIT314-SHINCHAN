import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ManageParticipants = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [pendingParticipants, setPendingParticipants] = useState([]);

  useEffect(() => {
    const organizerEmail = localStorage.getItem("email");
    if (organizerEmail) {
      fetch(`http://localhost:8080/api/events/organizer/${organizerEmail}`)
        .then((res) => res.json())
        .then((data) => setEvents(data))
        .catch((err) => console.error("Failed to fetch events", err));
    }
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetch(`http://localhost:8080/api/cart/pending/${selectedEventId}`)
        .then((res) => res.json())
        .then((data) => setPendingParticipants(data))
        .catch((err) => console.error("Failed to fetch participants", err));
    } else {
      setPendingParticipants([]);
    }
  }, [selectedEventId]);

  const handleApproval = async (registrationId, isApprove) => {
    const endpoint = isApprove ? "approve" : "reject";
    try {
      const response = await fetch(`http://localhost:8080/api/cart/${endpoint}/${registrationId}`, {
        method: "PUT",
      });
      if (!response.ok) throw new Error("Failed to update status");
      alert(`Successfully ${isApprove ? "approved" : "rejected"}!`);
      setPendingParticipants((prev) => prev.filter((p) => p.id !== registrationId));
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-purple-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-10">EventBoard</h2>
        <nav className="flex flex-col space-y-4">
          <Link to="/organizer" className="hover:underline">Dashboard</Link>
          <Link to="/create" className="hover:underline">Create Event</Link>
          <Link to="/manage" className="hover:underline font-semibold text-purple-100">Manage Participants</Link>
          <a href="/" onClick={() => localStorage.removeItem("email")} className="hover:underline text-red-300">Logout</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 bg-gray-50 overflow-y-auto">
        <h2 className="text-3xl font-bold text-purple-700 mb-8">Manage Participants</h2>

        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">Select Event:</label>
          <select
            className="w-full max-w-md border border-gray-300 rounded p-2"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="">-- Choose an event --</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        {pendingParticipants.length === 0 && selectedEventId && (
          <p className="text-gray-500">No pending participants for this event.</p>
        )}

        {pendingParticipants.length > 0 && (
          <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Ticket Type</th>
                  <th className="px-4 py-3 text-left">Quantity</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingParticipants.map((reg) => (
                  <tr key={reg.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">{reg.userEmail}</td>
                    <td className="px-4 py-3">{reg.ticketType}</td>
                    <td className="px-4 py-3">{reg.quantity}</td>
                    <td className="px-4 py-3">${reg.ticketPrice}</td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => handleApproval(reg.id, true)}
                        className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(reg.id, false)}
                        className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageParticipants;
