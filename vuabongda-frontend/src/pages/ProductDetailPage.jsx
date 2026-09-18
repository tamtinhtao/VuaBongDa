import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axiosClient.get(`/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        alert('Không tìm thấy sản phẩm!');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/500x400?text=No+Image';
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL}${url}`;
  };

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    const stock = product.stockQuantity ?? product.stock ?? 0;
    if (quantity < stock) {
      setQuantity(quantity + 1);
    } else {
      alert(`Chỉ còn ${stock} sản phẩm trong kho`);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('vb_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await axiosClient.post('/api/cart/items', {
        productId: product.id,
        quantity,
      });
      alert('Đã thêm sản phẩm vào giỏ hàng thành công!');
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
  };

  if (loading) return <div className="text-center py-5">Đang tải chi tiết sản phẩm...</div>;
  if (!product) return null;

  const stock = product.stockQuantity ?? product.stock ?? 0;

  return (
    <div className="container pb-5">
      <div className="row g-4 bg-white p-4 rounded shadow-sm">
        <div className="col-md-6 text-center">
          <img
            src={getImageUrl(product.imageUrl)}
            alt={product.name}
            className="img-fluid rounded object-fit-cover"
            style={{ maxHeight: '450px', width: '100%' }}
          />
        </div>

        <div className="col-md-6 d-flex flex-column">
          <h2 className="fw-bold">{product.name}</h2>
          <div className="text-muted mb-2">
            Thương hiệu: <strong>{product.brandName || product.brand || 'N/A'}</strong> | Danh mục:{' '}
            <strong>{product.categoryName || product.category?.name || 'N/A'}</strong>
          </div>

          <h3 className="text-success fw-bold my-3">
            {product.price?.toLocaleString('vi-VN')} đ
          </h3>

          <p className="text-secondary">{product.description || 'Chưa có mô tả chi tiết.'}</p>

          <div className="mb-3">
            Tồn kho: <span className="badge bg-secondary fs-6">{stock}</span>
          </div>

          <div className="d-flex align-items-center gap-3 my-4">
            <label className="fw-semibold">Số lượng:</label>
            <div className="input-group" style={{ width: '130px' }}>
              <button
                className="btn btn-outline-secondary"
                onClick={handleDecrease}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="text"
                className="form-control text-center"
                value={quantity}
                readOnly
              />
              <button
                className="btn btn-outline-secondary"
                onClick={handleIncrease}
                disabled={quantity >= stock}
              >
                +
              </button>
            </div>
          </div>

          <button
            className="btn btn-success btn-lg mt-auto"
            onClick={handleAddToCart}
            disabled={stock <= 0}
          >
            {stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;