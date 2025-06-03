
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ShortlistedPage = () => {
  const [shortlisted, setShortlisted] = useState([]);
  const [viewedEvent, setViewedEvent] = useState(null);
  const [registerEvent, setRegisterEvent] = useState(null);
  const [ticketType, setTicketType] = useState("General");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("email");

  useEffect(() => {
    const fetchShortlisted = async () => {
      if (!userEmail) {
        alert("Please log in.");
        navigate("/");
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/shortlist/${userEmail}`);
        if (!response.ok) throw new Error("Failed to load shortlist");
        const data = await response.json();
        setShortlisted(data);
      } catch (error) {
        alert("Error fetching shortlisted events: " + error.message);
      }
    };

    fetchShortlisted();
  }, [userEmail, navigate]);

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

  const handleRemove = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/shortlist/${userEmail}/${eventId}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to remove event");

      const refreshed = await fetch(`http://localhost:8080/api/shortlist/${userEmail}`);
      const data = await refreshed.json();
      setShortlisted(data);
    } catch (error) {
      alert("Error removing event: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 py-10 px-6">
      <div className="max-w-7xl mx-auto">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-purple-700">⭐ Your Shortlisted Events</h1>
        <div className="space-x-4">
          <button onClick={() => navigate("/my-tickets")} className="text-sm text-purple-600 hover:underline">🎫 My Tickets </button>
          <button onClick={() => navigate("/user")} className="text-sm text-purple-600 hover:underline">🏠 Home</button>
          <button onClick={() => setShowCart(true)} className="text-sm text-purple-600 hover:underline">🛒 View Cart ({cart.length})</button>
          <button onClick={() => navigate("/checkout")} className="text-sm text-purple-600 hover:underline">💳 Checkout</button>
          <button onClick={() => {
            localStorage.removeItem("email");
            navigate("/");
          }} className="text-sm text-red-600 hover:underline">Logout</button>
        </div>
      </nav>


        {shortlisted.length === 0 ? (
          <p className="text-center text-gray-500">You haven’t shortlisted any events yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shortlisted.map((entry, idx) => (
              <div
                key={idx}
                onClick={() => setViewedEvent(entry.event)}
                className="bg-white shadow rounded-xl overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition"
              >
                {entry.event.imageUrl && (
                  <img src={entry.event.imageUrl} alt={entry.event.name} className="w-full h-48 object-cover" />
                )}
                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">{entry.event.name}</h2>
                  <p className="text-sm text-gray-500">{entry.event.date} • {entry.event.location}</p>
                  <p className="text-sm mt-2 flex-grow text-gray-700">{entry.event.description}</p>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(entry.id.eventId);
                      }}
                      className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Remove
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRegisterEvent(entry.event);
                      }}
                      className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

            <div className="flex justify-end mt-6 space-x-2">
              <button onClick={() => setViewedEvent(null)} className="px-4 py-2 bg-gray-200 rounded">Close</button>
              <button
                onClick={() => {
                  setViewedEvent(null);
                  setRegisterEvent(viewedEvent);
                  setTicketType("General");
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

      {registerEvent && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Register for {registerEvent.name}</h2>

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
              <button onClick={handleAddToCart} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Add to Cart</button>
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
                    <p className="text-sm text-gray-600">Price: ${item.ticketPrice}</p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`http://localhost:8080/api/cart/${userEmail}/${item.eventId}`, {
                          method: "DELETE",
                        });
                        if (res.ok) {
                          setCart(cart.filter(i => i.eventId !== item.eventId));
                        } else {
                          throw new Error("Failed to remove item");
                        }
                      } catch (err) {
                        alert("❌ " + err.message);
                      }
                    }}
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
              onClick={() => setShowCart(false)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowCart(false);
                navigate("/checkout");
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default ShortlistedPage;
