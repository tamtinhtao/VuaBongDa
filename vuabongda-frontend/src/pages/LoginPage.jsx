import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosClient.post(
        "/api/auth/login",
        {
          username,
          password,
        }
      );

      const data = response.data;

      localStorage.setItem(
        "vb_token",
        data.token
      );

      localStorage.setItem(
        "vb_userId",
        data.userId
      );

      localStorage.setItem(
        "vb_username",
        data.username
      );

      localStorage.setItem(
        "vb_role",
        data.role
      );

      setMessage("Dang nhap thanh cong");

      console.log(
        "LOGIN THANH CONG:",
        data
      );

      // Chuyen trang theo role
      if (data.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/customer");
      }

    } catch (error) {
      console.error(
        "LOGIN THAT BAI:",
        error
      );

      if (error.response?.status === 401) {
        setMessage(
          "Sai username hoac mat khau"
        );
      } else {
        setMessage(
          "Co loi xay ra"
        );
      }
    }
  };

  return (
    <div>
      <h1>Dang nhap VuaBongDa</h1>

      <form onSubmit={handleLogin}>
        <div>
          <label>Username</label>
          <br />

          <input
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label>Password</label>
          <br />

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />
        </div>

        <br />

        <button type="submit">
          Dang nhap
        </button>
      </form>
      <br />

        <button
        type="button"
        onClick={() =>
            navigate("/register")
        }
>
        Chua co tai khoan? Dang ky
        </button>

      <p>{message}</p>
    </div>
  );
  
}

export default LoginPage;