import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setMessage("");

      await axiosClient.post(
        "/api/auth/register",
        {
          username,
          email,
          password,
          fullName,
          phone,
        }
      );

      alert("Dang ky tai khoan thanh cong");

      navigate("/login");

    } catch (error) {
      console.error(
        "REGISTER THAT BAI:",
        error
      );

      setMessage(
        error.response?.data?.message ||
        "Dang ky tai khoan that bai"
      );

    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Dang ky VuaBongDa</h1>

      <form onSubmit={handleRegister}>
        <div>
          <label>Username</label>
          <br />

          <input
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            required
          />
        </div>

        <br />

        <div>
          <label>Email</label>
          <br />

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />
        </div>

        <br />

        <div>
          <label>Mat khau</label>
          <br />

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />
        </div>

        <br />

        <div>
          <label>Ho va ten</label>
          <br />

          <input
            type="text"
            value={fullName}
            onChange={(e) =>
              setFullName(e.target.value)
            }
            required
          />
        </div>

        <br />

        <div>
          <label>So dien thoai</label>
          <br />

          <input
            type="text"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
          />
        </div>

        <br />

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Dang dang ky..."
            : "Dang ky"}
        </button>
      </form>

      {message && (
        <p style={{ color: "red" }}>
          {message}
        </p>
      )}

      <br />

      <button
        onClick={() =>
          navigate("/login")
        }
      >
        Da co tai khoan? Dang nhap
      </button>
    </div>
  );
}

export default RegisterPage;