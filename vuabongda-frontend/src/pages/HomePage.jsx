import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await axiosClient.get(
          "/api/products?page=0&size=4&sortBy=id&direction=desc"
        );

        const data = response.data;

        setProducts(
          Array.isArray(data)
            ? data.slice(0, 4)
            : (data.content || []).slice(0, 4)
        );
      } catch (error) {
        console.error("Khong tai duoc san pham:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("vi-VN") + " đ";

  return (
    <main className="shop-home">
      {/* BANNER */}
      <section className="shop-intro">
        <div className="shop-home-container intro-layout">
          <div className="intro-content">
            <p className="intro-label">VUABONGDA FOOTBALL STORE</p>

            <h1>
              Đồ bóng đá dành cho
              <br />
              mọi trận đấu
            </h1>

            <p className="intro-description">
              Giày bóng đá, áo đấu, bóng thi đấu và phụ kiện dành
              cho người chơi bóng từ tập luyện đến thi đấu.
            </p>

            <div className="intro-actions">
              <Link to="/products" className="intro-primary">
                Xem sản phẩm
              </Link>

              <a href="#home-products" className="intro-secondary">
                Sản phẩm mới
              </a>
            </div>
          </div>

          <div className="intro-panel">
            <div className="intro-panel-title">
              <span>Sản phẩm mới</span>
              <Link to="/products">Xem tất cả</Link>
            </div>

            <div className="intro-mini-products">
              {products.slice(0, 2).map((product) => (
                <Link
                  to={`/products/${product.id}`}
                  className="intro-mini-product"
                  key={product.id}
                >
                  <div className="intro-mini-image">
                    {product.imageUrl ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${product.imageUrl}`}
                        alt={product.name}
                      />
                    ) : (
                      <span>Không có ảnh</span>
                    )}
                  </div>

                  <div>
                    <strong>{product.name}</strong>
                    <p>{formatPrice(product.price)}</p>
                  </div>
                </Link>
              ))}

              {!loading && products.length === 0 && (
                <p className="empty-product-text">
                  Chưa có sản phẩm để hiển thị.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ƯU ĐIỂM */}
      <section className="home-info-bar">
        <div className="shop-home-container home-info-grid">
          <div>
            <strong>Giao hàng toàn quốc</strong>
            <span>Đóng gói và vận chuyển nhanh chóng</span>
          </div>

          <div>
            <strong>Sản phẩm chất lượng</strong>
            <span>Phù hợp với nhu cầu tập luyện và thi đấu</span>
          </div>

          <div>
            <strong>Thanh toán thuận tiện</strong>
            <span>COD hoặc chuyển khoản</span>
          </div>

          <div>
            <strong>Quản lý đơn hàng</strong>
            <span>Theo dõi lịch sử mua hàng dễ dàng</span>
          </div>
        </div>
      </section>

      {/* DANH MỤC */}
      <section className="home-content-section">
        <div className="shop-home-container">
          <div className="home-section-header">
            <div>
              <h2>Danh mục sản phẩm</h2>
              <p>Các nhóm sản phẩm chính tại VuaBongDa</p>
            </div>

            <Link to="/products">Xem tất cả</Link>
          </div>

          <div className="home-category-list">
            <Link to="/products" className="home-category-item">
              <span>01</span>
              <h3>Giày bóng đá</h3>
              <p>Dành cho sân cỏ nhân tạo và sân cỏ tự nhiên.</p>
            </Link>

            <Link to="/products" className="home-category-item">
              <span>02</span>
              <h3>Áo bóng đá</h3>
              <p>Trang phục tập luyện và thi đấu.</p>
            </Link>

            <Link to="/products" className="home-category-item">
              <span>03</span>
              <h3>Bóng đá</h3>
              <p>Bóng dành cho luyện tập và thi đấu.</p>
            </Link>

            <Link to="/products" className="home-category-item">
              <span>04</span>
              <h3>Phụ kiện</h3>
              <p>Các phụ kiện hỗ trợ người chơi bóng.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* SẢN PHẨM MỚI */}
      <section id="home-products" className="home-products-section">
        <div className="shop-home-container">
          <div className="home-section-header">
            <div>
              <h2>Sản phẩm mới</h2>
              <p>Một số sản phẩm mới được cập nhật</p>
            </div>

            <Link to="/products">Xem tất cả sản phẩm</Link>
          </div>

          {loading ? (
            <p>Đang tải sản phẩm...</p>
          ) : (
            <div className="home-product-grid">
              {products.map((product) => (
                <Link
                  to={`/products/${product.id}`}
                  className="home-product-card"
                  key={product.id}
                >
                  <div className="home-product-image">
                    {product.imageUrl ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${product.imageUrl}`}
                        alt={product.name}
                      />
                    ) : (
                      <span>Chưa có ảnh</span>
                    )}
                  </div>

                  <div className="home-product-info">
                    <small>{product.brand || "VuaBongDa"}</small>

                    <h3>{product.name}</h3>

                    <strong>{formatPrice(product.price)}</strong>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default HomePage;