import { useNavigate } from "react-router-dom";

function AdminPage() {
  const navigate = useNavigate();

  const username =
    localStorage.getItem(
      "vb_username"
    );

  const role =
    localStorage.getItem(
      "vb_role"
    );

  const handleLogout = () => {

    localStorage.removeItem(
      "vb_token"
    );

    localStorage.removeItem(
      "vb_userId"
    );

    localStorage.removeItem(
      "vb_username"
    );

    localStorage.removeItem(
      "vb_role"
    );

    navigate("/login");
  };

  return (
    <div>
      <h1>
        VuaBongDa - Admin
      </h1>

      <p>
        Xin chao Admin: {username}
      </p>

      <p>
        Role: {role}
      </p>
      <button
  onClick={() =>
    navigate("/admin/orders")
  }
>
  Quan ly don hang
</button>

<br />
<br />
<button
  onClick={() =>
    navigate("/admin/products")
  }
>
  Quan ly san pham
</button>

<br />
<br />
<button
  onClick={() =>
    navigate("/admin/categories")
  }
>
  Quan ly danh muc
</button>

<br />
<br />

      <button
        onClick={handleLogout}
      >
        Dang xuat
      </button>
    </div>
  );
}

export default AdminPage;