import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function OrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response =
          await axiosClient.get("/api/orders");

        setOrders(response.data);

        console.log(
          "GET ORDERS THANH CONG:",
          response.data
        );
      } catch (err) {
        console.error(
          "GET ORDERS THAT BAI:",
          err
        );

        setError(
          err.response?.data?.message ||
          "Khong the tai don hang"
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return <p>Dang tai don hang...</p>;
  }

  return (
    <div>
      <h1>Don hang cua toi</h1>

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

      {orders.length === 0 ? (
        <p>Ban chua co don hang nao.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
            }}
          >
            <h2>
              Don hang #{order.id}
            </h2>

            <p>
              Trang thai: {order.status}
            </p>

            <p>
              Nguoi nhan:{" "}
              {order.recipientName}
            </p>

            <p>
              Tong tien:{" "}
              {Number(
                order.totalAmount
              ).toLocaleString("vi-VN")}{" "}
              VND
            </p>

            <p>
              Ngay dat:{" "}
              {order.createdAt}
            </p>

            <button
              onClick={() =>
                navigate(
                  `/orders/${order.id}`
                )
              }
            >
              Xem chi tiet
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default OrdersPage;