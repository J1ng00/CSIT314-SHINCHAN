// OrganizerDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";


const OrganizerDashboard = () => {
  const organizerEmail = localStorage.getItem("email");
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewEvent, setViewEvent] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [newEvent, setNewEvent] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
    generalPrice: '',
    category: '',
    imageUrl: '',
    hasVIP: false,
    vipPrice: '',
    vipDescription: ''
  });

  useEffect(() => {
    if (viewEvent) {
      fetch(`http://localhost:8080/api/cart/stats/${viewEvent.id}`)
        .then(res => res.json())
        .then(data => setEventStats(data))
        .catch(err => console.error("Failed to fetch stats", err));
    }
  }, [viewEvent]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/events/organizer/${organizerEmail}`);
        if (!response.ok) throw new Error("Failed to fetch events");
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, [organizerEmail]);

  const handleImageUpload = async (e, eventStateUpdater) => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("http://localhost:8080/api/upload/image", {
      method: "POST",
      body: formData,
    });
    const imageUrl = await res.text();
    eventStateUpdater(prev => ({ ...prev, imageUrl })); // ✅ Works for both newEvent and selectedEvent
  } catch (err) {
    console.error("Upload failed:", err);
  }
};


  const handleCreateEvent = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newEvent, organizerEmail })
      });
      if (!response.ok) throw new Error("Failed to create event");
      const created = await response.json();
      setEvents([...events, created]);
      setNewEvent({ name: '', date: '', location: '', description: '', generalPrice: '', category: '', imageUrl: '', hasVIP: false, vipPrice: '', vipDescription: '' });
      setShowModal(false);
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleUpdateEvent = async () => {
    const updatedEvent = { ...selectedEvent }; // Ensure latest state is captured
    try {
      const response = await fetch(`http://localhost:8080/api/events/${updatedEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent)
      });
      if (!response.ok) throw new Error("Failed to update event");
      const updated = await response.json();
      setEvents(events.map(e => e.id === updated.id ? updated : e));
      setSelectedEvent(null);
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const response = await fetch(`http://localhost:8080/api/events/${selectedEvent.id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete event");
      setEvents(events.filter(e => e.id !== selectedEvent.id));
      setSelectedEvent(null);
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-purple-800 text-white flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-8">EventBoard</h2>
        <nav className="flex flex-col space-y-4">
          <Link to="/organizer" className="hover:underline">Dashboard</Link>
          <a href="#" onClick={() => setShowModal(true)} className="hover:underline">Create Event</a>
          <Link to="/manage" className="hover:underline">Manage Participants</Link>
          <a href="/" onClick={() => localStorage.removeItem("email")} className="hover:underline text-red-300">Logout</a>
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <h1 className="text-4xl font-bold text-purple-700 mb-6">Organizer Dashboard</h1>
        {events.length === 0 ? (
          <p className="text-gray-500">No events created yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div key={event.id} className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt="event banner" className="w-full h-40 object-cover rounded-md mb-4" />
                ) : (
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded-md mb-4 text-sm">No Image</div>
                )}
                <h2 className="text-xl font-semibold text-purple-800 mb-1">{event.name}</h2>
                <p className="text-sm text-gray-600">{event.date} @ {event.location}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">{event.status || 'Live'}</span>
                  <span className="text-sm text-gray-500">🎫 {event.registrations || 0}</span>
                </div>
                <div className="mt-4 flex justify-between">
                  <button onClick={() => setSelectedEvent(event)} className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">Edit</button>
                  <button onClick={() => setViewEvent(event)} className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600">View</button>
                  <button
                    onClick={async () => {
                      const message = prompt("Enter your message to notify participants:");
                      if (!message) return;
                    
                      try {
                        const response = await fetch(`http://localhost:8080/api/cart/notify/${event.id}`, {
                          method: "POST",
                          headers: { "Content-Type": "text/plain" },
                          body: message
                        });
                        if (!response.ok) throw new Error("Failed to send notifications");
                        alert("Notification sent successfully!");
                      } catch (err) {
                        alert("Error sending notifications: " + err.message);
                      }
                    }}
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                  >
                    Notify
                  </button>
                  <button onClick={async () => {
                    if (!window.confirm("Are you sure you want to cancel this event?")) return;
                    try {
                      const response = await fetch(`http://localhost:8080/api/events/${event.id}`, {
                        method: "DELETE"
                      });
                      if (!response.ok) throw new Error("Failed to cancel event");
                      setEvents(events.filter(e => e.id !== event.id));
                    } catch (error) {
                      alert("Error: " + error.message);
                    }
                  }} className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">Cancel Event</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* View/Edit Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="overflow-y-auto p-8">
              <h2 className="text-2xl font-bold text-purple-700 mb-4">Edit Event</h2>

              <label className="block text-sm font-medium mb-1">Event Banner</label>
              <input type="file" accept="image/*" onChange={e => handleImageUpload(e, setSelectedEvent)} className="mb-3" />

              <label className="block text-sm font-medium mb-1">Event Title</label>
              <input type="text" className="w-full border px-4 py-2 rounded mb-3" value={selectedEvent.name} onChange={e => setSelectedEvent({ ...selectedEvent, name: e.target.value })} />

              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" className="w-full border px-4 py-2 rounded mb-3" value={selectedEvent.date} onChange={e => setSelectedEvent({ ...selectedEvent, date: e.target.value })} />

              <label className="block text-sm font-medium mb-1">Location</label>
              <input type="text" className="w-full border px-4 py-2 rounded mb-3" value={selectedEvent.location} onChange={e => setSelectedEvent({ ...selectedEvent, location: e.target.value })} />

              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea className="w-full border px-4 py-2 rounded mb-3" value={selectedEvent.description} onChange={e => setSelectedEvent({ ...selectedEvent, description: e.target.value })} />

              <label className="block text-sm font-medium mb-1">General Price ($)</label>
              <input type="number" className="w-full border px-4 py-2 rounded mb-3" value={selectedEvent.generalPrice} onChange={e => setSelectedEvent({ ...selectedEvent, generalPrice: e.target.value })} />

              <label className="block text-sm font-medium mb-1">Category</label>
              <input type="text" className="w-full border px-4 py-2 rounded mb-3" value={selectedEvent.category} onChange={e => setSelectedEvent({ ...selectedEvent, category: e.target.value })} />

              <label className="flex items-center space-x-2 mb-3">
                <input type="checkbox" checked={selectedEvent.hasVIP} onChange={e => setSelectedEvent({ ...selectedEvent, hasVIP: e.target.checked })} />
                <span className="text-sm font-semibold">Include VIP?</span>
              </label>

              {selectedEvent.hasVIP && (
                <>
                  <label className="block text-sm font-medium mb-1">VIP Price</label>
                  <input type="number" className="w-full border px-4 py-2 rounded mb-3" value={selectedEvent.vipPrice} onChange={e => setSelectedEvent({ ...selectedEvent, vipPrice: e.target.value })} />

                  <label className="block text-sm font-medium mb-1">VIP Description</label>
                  <textarea className="w-full border px-4 py-2 rounded mb-3" value={selectedEvent.vipDescription} onChange={e => setSelectedEvent({ ...selectedEvent, vipDescription: e.target.value })} />
                </>
              )}
            </div>
            <div className="flex justify-between p-4 border-t">
              <button onClick={() => setSelectedEvent(null)} className="px-4 py-2 text-gray-600 hover:underline">Cancel</button>
              <div className="space-x-3">
                <button onClick={handleDeleteEvent} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                <button onClick={handleUpdateEvent} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="overflow-y-auto p-8">
              <h2 className="text-2xl font-bold text-purple-700 mb-4">Create New Event</h2>

              <label className="block text-sm font-medium mb-1">Event Banner</label>
              <input type="file" accept="image/*" onChange={e => handleImageUpload(e, setNewEvent)} className="mb-3" />

              <label className="block text-sm font-medium mb-1">Event Title</label>
              <input type="text" className="w-full border px-4 py-2 rounded mb-3" value={newEvent.name} onChange={e => setNewEvent({ ...newEvent, name: e.target.value })} />

              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" className="w-full border px-4 py-2 rounded mb-3" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} />

              <label className="block text-sm font-medium mb-1">Location</label>
              <input type="text" className="w-full border px-4 py-2 rounded mb-3" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} />

              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea className="w-full border px-4 py-2 rounded mb-3" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} />

              <label className="block text-sm font-medium mb-1">General Price ($)</label>
              <input type="number" className="w-full border px-4 py-2 rounded mb-3" value={newEvent.generalPrice} onChange={e => setNewEvent({ ...newEvent, generalPrice: e.target.value })} />

              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="w-full border px-4 py-2 rounded mb-3" value={newEvent.category} onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}>
                <option value="">Select category</option>
                <option value="Music">Music</option>
                <option value="Technology">Technology</option>
                <option value="Business">Business</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
                <option value="Sports">Sports</option>
              </select>

              <label className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  checked={newEvent.hasVIP}
                  onChange={e => setNewEvent({ ...newEvent, hasVIP: e.target.checked })}
                />
                <span className="text-sm font-semibold">Include VIP?</span>
              </label>

              {newEvent.hasVIP && (
                <>
                  <label className="block text-sm font-medium mb-1">VIP Price</label>
                  <input type="number" className="w-full border px-4 py-2 rounded mb-3" value={newEvent.vipPrice} onChange={e => setNewEvent({ ...newEvent, vipPrice: e.target.value })} />

                  <label className="block text-sm font-medium mb-1">VIP Description</label>
                  <textarea className="w-full border px-4 py-2 rounded mb-3" value={newEvent.vipDescription} onChange={e => setNewEvent({ ...newEvent, vipDescription: e.target.value })} />
                </>
              )}
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:underline">Cancel</button>
              <button onClick={handleCreateEvent} className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Create</button>
            </div>
          </div>
        </div>
      )}

      {viewEvent && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
          <div className="overflow-y-auto p-8">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">{viewEvent.name}</h2>
            {viewEvent.imageUrl && (
              <img src={viewEvent.imageUrl} alt="event" className="mb-4 w-full h-40 object-cover rounded" />
            )}

            {eventStats ? (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg">
                  <p className="text-sm font-semibold">Total Participants</p>
                  <p className="text-xl">{eventStats.totalParticipants}</p>
                </div>
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                  <p className="text-sm font-semibold">Total Revenue</p>
                  <p className="text-xl">${eventStats.totalRevenue}</p>
                </div>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                  <p className="text-sm font-semibold">General Tickets</p>
                  <p className="text-xl">{eventStats.generalCount}</p>
                </div>
                <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
                  <p className="text-sm font-semibold">VIP Tickets</p>
                  <p className="text-xl">{eventStats.vipCount}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-6">Loading statistics...</p>
            )}

            <p><strong>Date:</strong> {viewEvent.date}</p>
            <p><strong>Location:</strong> {viewEvent.location}</p>
            <p className="mt-2"><strong>Description:</strong></p>
            <p className="text-sm text-gray-700">{viewEvent.description}</p>
            <p className="mt-2"><strong>General Price:</strong> ${viewEvent.generalPrice}</p>
            <p><strong>Category:</strong> {viewEvent.category}</p>
            {viewEvent.hasVIP && (
              <>
                <p className="mt-2"><strong>VIP Price:</strong> ${viewEvent.vipPrice}</p>
                <p><strong>VIP Description:</strong> {viewEvent.vipDescription}</p>
              </>
            )}
          </div>
          <div className="flex justify-end p-4 border-t">
            <button onClick={() => setViewEvent(null)} className="px-4 py-2 text-gray-600 hover:underline">Close</button>
          </div>
        </div>
      </div>
    )}

    </div>
  );
};

export default OrganizerDashboard;
