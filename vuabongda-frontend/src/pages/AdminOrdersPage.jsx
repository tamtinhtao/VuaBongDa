import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function AdminOrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadOrders = async () => {
    try {
      const response = await axiosClient.get(
        "/api/admin/orders"
      );

      setOrders(response.data);

      console.log(
        "ADMIN GET ORDERS THANH CONG:",
        response.data
      );
    } catch (error) {
      console.error(
        "ADMIN GET ORDERS THAT BAI:",
        error
      );

      setMessage(
        error.response?.data?.message ||
        "Khong the tai danh sach don hang"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = (
    orderId,
    newStatus
  ) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              selectedStatus: newStatus,
            }
          : order
      )
    );
  };

  const handleUpdateStatus = async (
    order
  ) => {
    const newStatus =
      order.selectedStatus || order.status;

    try {
      const response = await axiosClient.put(
        `/api/admin/orders/${order.id}/status`,
        {
          status: newStatus,
        }
      );

      setMessage(
        `Cap nhat don #${order.id} thanh cong`
      );

      setOrders((currentOrders) =>
        currentOrders.map((item) =>
          item.id === order.id
            ? {
                ...response.data,
                selectedStatus:
                  response.data.status,
              }
            : item
        )
      );

    } catch (error) {
      console.error(
        "UPDATE ORDER STATUS THAT BAI:",
        error
      );

      setMessage(
        error.response?.data?.message ||
        "Khong the cap nhat trang thai"
      );
    }
  };

  if (loading) {
    return (
      <p>Dang tai danh sach don hang...</p>
    );
  }

  return (
    <div>
      <h1>Quan ly don hang</h1>

      <button
        onClick={() =>
          navigate("/admin")
        }
      >
        Quay lai Admin
      </button>

      <br />
      <br />

      {message && (
        <p>{message}</p>
      )}

      {orders.length === 0 ? (
        <p>Chua co don hang nao.</p>
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
              User ID: {order.userId}
            </p>

            <p>
              Nguoi nhan:{" "}
              {order.recipientName}
            </p>

            <p>
              SDT: {order.phone}
            </p>

            <p>
              Dia chi:{" "}
              {order.shippingAddress}
            </p>

            <p>
              Tong tien:{" "}
              {Number(
                order.totalAmount
              ).toLocaleString("vi-VN")}{" "}
              VND
            </p>

            <p>
              Trang thai hien tai:{" "}
              <strong>
                {order.status}
              </strong>
            </p>

            <h3>San pham</h3>

            {order.items?.map((item) => (
              <div key={item.id}>
                <p>
                  {item.productName}
                  {" - SL: "}
                  {item.quantity}
                  {" - "}
                  {Number(
                    item.subtotal
                  ).toLocaleString("vi-VN")}
                  {" VND"}
                </p>
              </div>
            ))}

            <hr />

            <label>
              Cap nhat trang thai:
            </label>

            <br />

            <select
              value={
                order.selectedStatus ||
                order.status
              }
              onChange={(e) =>
                handleStatusChange(
                  order.id,
                  e.target.value
                )
              }
            >
              <option value="PENDING">
                PENDING
              </option>

              <option value="CONFIRMED">
                CONFIRMED
              </option>

              <option value="SHIPPING">
                SHIPPING
              </option>

              <option value="COMPLETED">
                COMPLETED
              </option>

              <option value="CANCELLED">
                CANCELLED
              </option>
            </select>

            {" "}

            <button
              onClick={() =>
                handleUpdateStatus(order)
              }
            >
              Cap nhat
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminOrdersPage;