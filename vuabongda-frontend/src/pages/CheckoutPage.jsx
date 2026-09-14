import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function CheckoutPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);

  const [recipientName, setRecipientName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [shippingAddress, setShippingAddress] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("COD");

  const [message, setMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  // ================================
  // LOAD CART
  // ================================
  useEffect(() => {
    const loadCart = async () => {
      try {
        const response =
          await axiosClient.get(
            "/api/cart"
          );

        setCart(response.data);
      } catch (error) {
        console.error(
          "LOAD CART THAT BAI:",
          error
        );

        setMessage(
          "Khong the tai gio hang"
        );
      }
    };

    loadCart();
  }, []);

  // ================================
  // DAT HANG
  // ================================
  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!cart?.items?.length) {
      setMessage(
        "Gio hang dang trong"
      );

      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const response =
        await axiosClient.post(
          "/api/orders",
          {
            recipientName,
            phone,
            shippingAddress,
            paymentMethod,
          }
        );

      console.log(
        "DAT HANG THANH CONG:",
        response.data
      );

      const orderId =
        response.data.id;

      navigate(
        `/order-success/${orderId}`
      );

    } catch (error) {
      console.error(
        "DAT HANG THAT BAI:",
        error
      );

      setMessage(
        error.response?.data?.message ||
        "Dat hang that bai"
      );

    } finally {
      setSubmitting(false);
    }
  };

  if (!cart) {
    return (
      <p>Dang tai checkout...</p>
    );
  }

  return (
    <div>
      <h1>Thanh toan</h1>

      <button
        onClick={() =>
          navigate("/cart")
        }
      >
        Quay lai gio hang
      </button>

      <hr />

      <h2>Don hang</h2>

      {cart.items.map((item) => (
        <div key={item.id}>
          <p>
            {item.productName}
            {" x "}
            {item.quantity}
          </p>

          <p>
            Thanh tien:{" "}
            {Number(
              item.subtotal
            ).toLocaleString("vi-VN")}{" "}
            VND
          </p>
        </div>
      ))}

      <h3>
        Tong thanh toan:{" "}
        {Number(
          cart.totalAmount
        ).toLocaleString("vi-VN")}{" "}
        VND
      </h3>

      <hr />

      <form
        onSubmit={handleCheckout}
      >
        <div>
          <label>
            Ten nguoi nhan
          </label>

          <br />

          <input
            type="text"
            value={recipientName}
            onChange={(e) =>
              setRecipientName(
                e.target.value
              )
            }
            required
          />
        </div>

        <br />

        <div>
          <label>
            So dien thoai
          </label>

          <br />

          <input
            type="text"
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value
              )
            }
            required
          />
        </div>

        <br />

        <div>
          <label>
            Dia chi giao hang
          </label>

          <br />

          <textarea
            value={shippingAddress}
            onChange={(e) =>
              setShippingAddress(
                e.target.value
              )
            }
            required
          />
        </div>

        <br />

        <div>
          <label>
            Phuong thuc thanh toan
          </label>

          <br />

          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(
                e.target.value
              )
            }
          >
            <option value="COD">
              COD
            </option>

            <option value="BANK_TRANSFER">
              Chuyen khoan ngan hang
            </option>
          </select>
        </div>

        <br />

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Dang dat hang..."
            : "Dat hang"}
        </button>
      </form>

      {message && (
        <p style={{ color: "red" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default CheckoutPage;