import React, { useEffect, useState } from "react";

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const userEmail = localStorage.getItem("email");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/cart/user/${userEmail}/CONFIRMED`);
        const data = await res.json();
        console.log("Fetched tickets:", data);
        setTickets(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("❌ Failed to fetch completed tickets:", error);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [userEmail]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-700">🎟️ My Tickets</h1>
        <div className="space-x-4">
          <button onClick={() => window.location.href = '/user'} className="text-sm text-purple-600 hover:underline">Home</button>
          <button onClick={() => {
            localStorage.removeItem("email");
            window.location.href = "/";
          }} className="text-sm text-red-600 hover:underline">Logout</button>
        </div>
      </nav>

      <main className="w-full px-6 py-10 max-w-7xl mx-auto">
        {loading ? (
          <p className="text-center text-gray-600">Loading your tickets...</p>
        ) : tickets.length === 0 ? (
          <p className="text-center text-gray-600">You have no confirmed tickets yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow p-4 flex flex-col hover:shadow-lg transition"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-1">{ticket.eventName}</h2>
                <p className="text-sm text-purple-700 font-medium">Ticket Type: {ticket.ticketType}</p>
                <p className="text-sm text-gray-700">Quantity: {ticket.quantity}</p>
                <p className="text-sm font-semibold text-green-600">Total: ${ticket.ticketPrice * ticket.quantity}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTickets;
