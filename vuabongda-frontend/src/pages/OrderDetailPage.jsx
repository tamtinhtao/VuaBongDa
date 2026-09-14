import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import axiosClient from "../api/axiosClient";

function OrderDetailPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] =
    useState(null);

  const [payment, setPayment] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const orderResponse =
          await axiosClient.get(
            `/api/orders/${orderId}`
          );

        setOrder(
          orderResponse.data
        );

        const paymentResponse =
          await axiosClient.get(
            `/api/payments/order/${orderId}`
          );

        setPayment(
          paymentResponse.data
        );

      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
          "Khong the tai don hang"
        );

      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [orderId]);

  if (loading) {
    return <p>Dang tai...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>
        Chi tiet don #{order?.id}
      </h1>

      <button
        onClick={() =>
          navigate("/orders")
        }
      >
        Quay lai
      </button>

      <hr />

      <p>
        Trang thai: {order?.status}
      </p>

      <p>
        Nguoi nhan:{" "}
        {order?.recipientName}
      </p>

      <p>
        SDT: {order?.phone}
      </p>

      <p>
        Dia chi:{" "}
        {order?.shippingAddress}
      </p>

      <hr />

      <h2>San pham</h2>

      {order?.items?.map((item) => (
        <div key={item.id}>
          <h3>
            {item.productName}
          </h3>

          <p>
            Gia:{" "}
            {Number(
              item.unitPrice
            ).toLocaleString("vi-VN")}{" "}
            VND
          </p>

          <p>
            So luong: {item.quantity}
          </p>

          <p>
            Thanh tien:{" "}
            {Number(
              item.subtotal
            ).toLocaleString("vi-VN")}{" "}
            VND
          </p>

          <hr />
        </div>
      ))}

      <h2>
        Tong tien:{" "}
        {Number(
          order?.totalAmount || 0
        ).toLocaleString("vi-VN")}{" "}
        VND
      </h2>

      <h2>Thanh toan</h2>

      <p>
        Phuong thuc:{" "}
        {payment?.paymentMethod}
      </p>

      <p>
        Trang thai:{" "}
        {payment?.status}
      </p>
    </div>
  );
}

export default OrderDetailPage;