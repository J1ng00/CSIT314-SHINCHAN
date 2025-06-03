import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const userEmail = localStorage.getItem("email");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/cart/${userEmail}`);
        const data = await res.json();
        setCart(data);

        const grandTotal = data.reduce(
          (acc, item) => acc + item.ticketPrice * item.quantity,
          0
        );
        setTotal(grandTotal);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
      }
    };

    fetchCart();
  }, [userEmail]);

  const handleConfirm = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail,
            cartItems: cart,
            amount: total,
          }),
        });

        if (res.ok) {
          alert("✅ Payment successful!");
          navigate("/user"); // or redirect to /thank-you
        } else {
          throw new Error("Payment failed");
        }
      } catch (err) {
        alert("❌ " + err.message);
      }
    };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
        <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-purple-700">💳 Checkout</h1>
          <div className="space-x-4">
            <button onClick={() => navigate("/my-tickets")} className="text-sm text-purple-600 hover:underline">🎫 My Tickets </button>
            <button onClick={() => navigate("/user")} className="text-sm text-purple-600 hover:underline">🏠 Home</button>
            <button onClick={() => navigate("/shortlist")} className="text-sm text-purple-600 hover:underline">⭐ Shortlist</button>
            <button onClick={() => navigate("/checkout")} className="text-sm text-purple-600 hover:underline">💳 Checkout</button>
            <button
              onClick={() => {
                localStorage.removeItem("email");
                navigate("/");
              }}
              className="text-sm text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>
        </nav>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-purple-700 mb-6">💳 Checkout</h1>

        <p className="text-sm text-gray-500 mb-4">Logged in as: <strong>{userEmail}</strong></p>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <ul className="divide-y">
              {cart.map((item, idx) => (
                <li key={idx} className="py-4 flex justify-between">
                  <div>
                    <p className="font-semibold">{item.eventName}</p>
                    <p className="text-sm text-gray-600">{item.ticketType} • Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right text-sm text-gray-700">
                    ${item.ticketPrice * item.quantity}
                  </div>
                </li>
              ))}
            </ul>

            <div className="text-right font-bold text-lg mt-6">
              Total: ${total.toFixed(2)}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleConfirm}
                className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Confirm & Pay
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
