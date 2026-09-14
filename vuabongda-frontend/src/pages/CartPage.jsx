import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function CartPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================================
  // LOAD CART
  // ================================
  const loadCart = async () => {
    try {
      const response = await axiosClient.get(
        "/api/cart"
      );

      setCart(response.data);
      setError("");

      console.log(
        "GET CART THANH CONG:",
        response.data
      );
    } catch (err) {
      console.error(
        "GET CART THAT BAI:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Khong the tai gio hang"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // ================================
  // CAP NHAT QUANTITY
  // ================================
  const updateQuantity = async (
    itemId,
    newQuantity
  ) => {
    try {
      const response = await axiosClient.put(
        `/api/cart/items/${itemId}`,
        {
          quantity: newQuantity,
        }
      );

      setCart(response.data);
      setError("");
    } catch (err) {
      console.error(
        "UPDATE CART THAT BAI:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Khong the cap nhat gio hang"
      );
    }
  };

  // ================================
  // TANG QUANTITY
  // ================================
  const handleIncrease = (item) => {
    updateQuantity(
      item.id,
      item.quantity + 1
    );
  };

  // ================================
  // GIAM QUANTITY
  // ================================
  const handleDecrease = async (item) => {
    if (item.quantity <= 1) {
      await handleRemove(item.id);
      return;
    }

    updateQuantity(
      item.id,
      item.quantity - 1
    );
  };

  // ================================
  // XOA ITEM
  // ================================
  const handleRemove = async (itemId) => {
    try {
      const response =
        await axiosClient.delete(
          `/api/cart/items/${itemId}`
        );

      setCart(response.data);
      setError("");
    } catch (err) {
      console.error(
        "DELETE CART ITEM THAT BAI:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Khong the xoa san pham"
      );
    }
  };

  if (loading) {
    return (
      <p>Dang tai gio hang...</p>
    );
  }

  return (
    <div>
      <h1>Gio hang cua toi</h1>

      <button
        onClick={() =>
          navigate("/customer")
        }
      >
        Quay lai
      </button>

      <br />
      <br />

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {cart?.items?.length === 0 ? (
        <p>Gio hang dang trong.</p>
      ) : (
        <>
          {cart?.items?.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              <h3>
                {item.productName}
              </h3>

              <p>
                Product ID: {item.productId}
              </p>

              <p>
                Gia:{" "}
                {Number(
                  item.price
                ).toLocaleString("vi-VN")}{" "}
                VND
              </p>

              <p>
                So luong: {item.quantity}
              </p>

              <button
                onClick={() =>
                  handleDecrease(item)
                }
              >
                -
              </button>

              <span
                style={{
                  margin: "0 15px",
                }}
              >
                {item.quantity}
              </span>

              <button
                onClick={() =>
                  handleIncrease(item)
                }
              >
                +
              </button>

              <br />
              <br />

              <p>
                Thanh tien:{" "}
                {Number(
                  item.subtotal
                ).toLocaleString("vi-VN")}{" "}
                VND
              </p>

              <button
                onClick={() =>
                  handleRemove(item.id)
                }
              >
                Xoa san pham
              </button>
            </div>
          ))}

          <h2>
            Tong tien:{" "}
            {Number(
              cart?.totalAmount || 0
            ).toLocaleString("vi-VN")}{" "}
            VND
          </h2>
          <button
  onClick={() =>
    navigate("/checkout")
  }
>
  Tien hanh thanh toan
</button>
        </>
      )}
    </div>
  );
}

export default CartPage;