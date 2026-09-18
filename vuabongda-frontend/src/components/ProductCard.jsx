import React from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/300x200?text=No+Image';
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL}${url}`;
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('vb_token');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await axiosClient.post('/api/cart/items', {
        productId: product.id,
        quantity: 1,
      });
      alert('Đã thêm sản phẩm vào giỏ hàng!');
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi thêm giỏ hàng');
    }
  };

  return (
    <div
      className="card h-100 shadow-sm custom-product-card"
      style={{ cursor: 'pointer' }}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <img
        src={getImageUrl(product.imageUrl)}
        className="card-img-top object-fit-cover"
        alt={product.name}
        style={{ height: '220px' }}
      />
      <div className="card-body d-flex flex-column">
        <div className="text-muted small mb-1">
          {product.brandName || product.brand || 'Thương hiệu'}
        </div>
        <h5 className="card-title text-truncate">{product.name}</h5>
        <div className="text-success fw-bold fs-5 my-2">
          {product.price?.toLocaleString('vi-VN')} đ
        </div>
        <div className="small text-secondary mb-3">
          Danh mục: {product.categoryName || product.category?.name || 'N/A'} <br />
          Tồn kho: {product.stockQuantity ?? product.stock ?? 0}
        </div>
        <div className="mt-auto d-flex gap-2">
          <button
            className="btn btn-outline-primary flex-grow-1"
            onClick={() => navigate(`/products/${product.id}`)}
          >
            Xem chi tiết
          </button>
          <button className="btn btn-success" onClick={handleAddToCart}>
            Thêm giỏ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;