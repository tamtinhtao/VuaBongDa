import { useNavigate } from "react-router-dom";

function CustomerPage() {
  const navigate = useNavigate();

  const username =
    localStorage.getItem("vb_username");

  const role =
    localStorage.getItem("vb_role");

  const handleLogout = () => {
    localStorage.removeItem("vb_token");
    localStorage.removeItem("vb_userId");
    localStorage.removeItem("vb_username");
    localStorage.removeItem("vb_role");

    navigate("/login");
  };

  const handleViewCart = () => {
    navigate("/cart");
  };

  return (
    <div>
      <h1>VuaBongDa - Customer</h1>

      <p>Xin chao: {username}</p>

      <p>Role: {role}</p>

      <button onClick={handleViewCart}>
        Xem gio hang
      </button>

      <br />
      <br />
      <button
  onClick={() =>
    navigate("/orders")
  }
>
  Don hang cua toi
</button>

<br />
<br />

      <button onClick={handleLogout}>
        Dang xuat
      </button>
    </div>
  );
}

export default CustomerPage;