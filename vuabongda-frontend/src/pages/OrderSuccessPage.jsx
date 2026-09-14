import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function OrderSuccessPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        // Lay thong tin Order
        const orderResponse =
          await axiosClient.get(
            `/api/orders/${orderId}`
          );

        setOrder(orderResponse.data);

        // Lay thong tin Payment
        const paymentResponse =
          await axiosClient.get(
            `/api/payments/order/${orderId}`
          );

        setPayment(paymentResponse.data);

        console.log(
          "ORDER THANH CONG:",
          orderResponse.data
        );

        console.log(
          "PAYMENT:",
          paymentResponse.data
        );

      } catch (err) {
        console.error(
          "LOAD ORDER THAT BAI:",
          err
        );

        setError(
          err.response?.data?.message ||
          "Khong the tai thong tin don hang"
        );

      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <p>Dang tai thong tin don hang...</p>
    );
  }

  if (error) {
    return (
      <div>
        <h2>{error}</h2>

        <button
          onClick={() =>
            navigate("/customer")
          }
        >
          Ve trang Customer
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Dat hang thanh cong</h1>

      <p>
        Ma don hang: #{order?.id}
      </p>

      <p>
        Trang thai: {order?.status}
      </p>

      <hr />

      <h2>Thong tin giao hang</h2>

      <p>
        Nguoi nhan:{" "}
        {order?.recipientName}
      </p>

      <p>
        So dien thoai:{" "}
        {order?.phone}
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

      <hr />

      <h2>Thanh toan</h2>

      <p>
        Phuong thuc:{" "}
        {payment?.paymentMethod}
      </p>

      <p>
        Trang thai thanh toan:{" "}
        {payment?.status}
      </p>

      <p>
        So tien:{" "}
        {Number(
          payment?.amount || 0
        ).toLocaleString("vi-VN")}{" "}
        VND
      </p>

      <br />

      <button
        onClick={() =>
          navigate("/customer")
        }
      >
        Tiep tuc mua hang
      </button>

      {" "}

      <button
        onClick={() =>
          navigate("/orders")
        }
      >
        Xem don hang cua toi
      </button>
    </div>
  );
}

export default OrderSuccessPage;