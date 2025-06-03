
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserLandingPage = () => {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [search, setSearch] = useState('');
  const [viewedEvent, setViewedEvent] = useState(null);     // For view modal
  const [registerEvent, setRegisterEvent] = useState(null); // For register modal
  const [ticketType, setTicketType] = useState('General');
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("email");

  useEffect(() => {
    const fetchEvents = async () => {
      let query = `?page=${page}`;
      if (category) query += `&category=${category}`;
      if (date) query += `&date=${date}`;
      if (location) query += `&location=${location}`;
      if (search) query += `&q=${search}`;

      try {
        const res = await fetch(`http://localhost:8080/api/events${query}`);
        const data = await res.json();
        setEvents(data.events || data);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("❌ Failed to fetch events:", err);
      }
    };
    fetchEvents();
  }, [page, category, date, location, search]);

  const handleRemoveFromCart = async (eventId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/cart/${userEmail}/${eventId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCart(cart.filter(item => item.eventId !== eventId));
      } else {
        throw new Error("Failed to remove item");
      }
    } catch (err) {
      console.error(err);
      alert("❌ " + err.message);
    }
  };


  const handleAddToCart = async () => {
    const unitPrice = ticketType === "VIP" ? registerEvent.vipPrice : registerEvent.generalPrice;
      const item = {
        userEmail,
        eventId: registerEvent.id,
        eventName: registerEvent.name,
        ticketType,
        ticketPrice: unitPrice,
        quantity,
        totalPrice: unitPrice * quantity,
      };

    try {
      const res = await fetch("http://localhost:8080/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      if (res.ok) {
        alert("🛒 Added to cart!");
        setRegisterEvent(null);
      } else {
        throw new Error("Failed to add to cart");
      }
    } catch (err) {
      console.error(err);
      alert("❌ " + err.message);
    }
  };
  
  useEffect(() => {
    const fetchCart = async () => {
      if (showCart && userEmail) {
        try {
          const res = await fetch(`http://localhost:8080/api/cart/${userEmail}`);
          const data = await res.json();
          setCart(data);
        } catch (err) {
          console.error("❌ Failed to fetch cart:", err);
        }
      }
    };
    fetchCart();
  }, [showCart, userEmail]);


  const handleShortlist = async (eventId) => {
    try {
      const res = await fetch("http://localhost:8080/api/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, eventId }),
      });
      if (res.ok) alert("✅ Shortlisted!");
      else throw new Error("Failed to shortlist");
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-700">🎟️ Discover Your Next Experience</h1>
        <div className="space-x-4">
          <button onClick={() => navigate("/my-tickets")} className="text-sm text-purple-600 hover:underline">🎫 My Tickets </button>
          <button onClick={() => window.location.href = '/shortlist'} className="text-sm text-purple-600 hover:underline">My Shortlist</button>
          <button onClick={() => setShowCart(true)} className="text-sm text-purple-600 hover:underline">🛒 View Cart ({cart.length})</button>
          <button onClick={() => navigate("/checkout")} className="text-sm text-purple-600 hover:underline">💳 Checkout</button>
          <button onClick={() => {
            localStorage.removeItem("email");
            window.location.href = "/";
          }} className="text-sm text-red-600 hover:underline">Logout</button>
        </div>
      </nav>

      {/* Modern Filters */}
      <div className="bg-white py-6 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-5 gap-4">
          <select value={category} onChange={e => setCategory(e.target.value)} className="border px-4 py-2 rounded-md">
            <option value="">All Categories</option>
            <option value="Music">Music</option>
            <option value="Business">Business</option>
            <option value="Technology">Technology</option>
            <option value="Sports">Sports</option>
            <option value="Education">Education</option>
          </select>

          <select value={date} onChange={e => setDate(e.target.value)} className="border px-4 py-2 rounded-md">
            <option value="">Any Date</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
          </select>

          <input
            type="text"
            placeholder="Anywhere"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="border px-4 py-2 rounded-md"
          />

          <input
            type="text"
            placeholder="Search events"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border px-4 py-2 rounded-md col-span-2"
          />
        </div>
      </div>

        {/* Event Grid */}
        <main className="w-full px-6 py-10 max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.length === 0 ? (
              <p className="col-span-full text-center text-gray-500">No events found.</p>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => setViewedEvent(event)}
                  className="bg-white rounded-xl shadow overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition"
                >
                  {event.imageUrl && (
                    <img src={event.imageUrl} alt={event.name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4 flex-grow flex flex-col">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">{event.name}</h2>
                    <p className="text-sm text-gray-500">{event.date} • {event.location}</p>
                    {event.hasVIP && (
                      <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded mt-1 w-fit">
                        VIP Available
                      </span>
                    )}
                    <p className="text-sm mt-2 flex-grow text-gray-700">{event.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm font-medium text-green-600">
                        {event.generalPrice > 0 ? `$${event.generalPrice}` : "Free"}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShortlist(event.id);
                          }}
                          className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRegisterEvent(event);
                          }}
                          className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-4 py-2 text-gray-700">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </main>

      {registerEvent && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add to Cart for {registerEvent.name}</h2>

            <label className="block mb-2 font-medium">Ticket Type</label>
            <select
              value={ticketType}
              onChange={(e) => setTicketType(e.target.value)}
              className="w-full border rounded p-2 mb-4"
            >
              <option value="General">General - ${registerEvent.generalPrice}</option>
              {registerEvent.hasVIP && (
                <option value="VIP">VIP - ${registerEvent.vipPrice}</option>
              )}
            </select>
            
            <label className="block mb-2 font-medium">Quantity</label>
            <input
              type="number"
              value={quantity}
              min={1}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full border rounded p-2 mb-4"
            />

            <div className="flex justify-end space-x-2">
              <button onClick={() => setRegisterEvent(null)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={handleAddToCart} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Confirm</button>
            </div>
          </div>
        </div>
      )}

    {viewedEvent && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full">
          {viewedEvent.imageUrl && (
            <img src={viewedEvent.imageUrl} alt={viewedEvent.name} className="w-full h-64 object-cover rounded mb-4" />
          )}

          <h2 className="text-2xl font-bold mb-2">{viewedEvent.name}</h2>
          <p className="text-gray-600 mb-1">{viewedEvent.date} • {viewedEvent.location}</p>
          <p className="text-sm text-gray-500 mb-2">Category: {viewedEvent.category}</p>
          <p className="text-sm text-gray-500 mb-4">Organized by: {viewedEvent.organizerEmail}</p>
        
          <p className="mb-4 text-gray-700 whitespace-pre-wrap">{viewedEvent.description}</p>
        
          {/* Ticket Info */}
          <div className="mb-4">
            <p className="text-green-600 font-semibold">
              General Ticket: {viewedEvent.generalPrice > 0 ? `$${viewedEvent.generalPrice}` : "Free"}
            </p>
            {viewedEvent.hasVIP && (
              <>
                <p className="text-purple-600 font-semibold mt-2">
                  VIP Ticket: ${viewedEvent.vipPrice}
                </p>
                {viewedEvent.vipDescription && (
                  <p className="text-sm text-gray-600 mt-1 italic">
                    {viewedEvent.vipDescription}
                  </p>
                )}
              </>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end mt-6 space-x-2">
            <button onClick={() => setViewedEvent(null)} className="px-4 py-2 bg-gray-200 rounded">
              Close
            </button>
            <button
              onClick={() => {
                handleShortlist(viewedEvent.id);
              }}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Shortlist
            </button>
            <button
              onClick={() => {
                setViewedEvent(null);
                setRegisterEvent(viewedEvent);
                setTicketType('General');
                setQuantity(1);
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    )}

    {showCart && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">🛒 Your Cart</h2>
            {cart.length === 0 ? (
              <p className="text-gray-600">Your cart is empty.</p>
            ) : (
              <ul className="space-y-2">
                {cart.map((item, idx) => (
                  <li
                    key={idx}
                    className="border p-3 rounded flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">{item.eventName}</p>
                      <p className="text-sm text-gray-600">Ticket: {item.ticketType}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600">Price: {item.ticketPrice}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(item.eventId)}
                      className="text-sm text-red-500 hover:underline ml-4"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCart(false);
                  navigate("/checkout");
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Checkout
              </button>
              <button onClick={() => setShowCart(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




export default UserLandingPage;
