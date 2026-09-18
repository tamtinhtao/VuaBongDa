import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import ProductCard from '../components/ProductCard';
import SearchBox from '../components/SearchBox';
import CategoryMenu from '../components/CategoryMenu';


const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const keyword = searchParams.get('keyword') || '';
  const page = parseInt(searchParams.get('page') || '0', 10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `/api/products?page=${page}&size=12&sortBy=id&direction=desc`;
        if (keyword) {
          url = `/api/products?keyword=${encodeURIComponent(keyword)}&page=${page}&size=12`;
        }

        const res = await axiosClient.get(url);
        if (res.data?.content) {
          setProducts(res.data.content);
          setTotalPages(res.data.totalPages || 1);
        } else {
          setProducts(Array.isArray(res.data) ? res.data : []);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('Lỗi kết nối API:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, page]);

  const handleSearch = (newKeyword) => {
    setSearchParams({ keyword: newKeyword, page: 0 });
  };

  const handlePageChange = (newPage) => {
    const params = { page: newPage };
    if (keyword) params.keyword = keyword;
    setSearchParams(params);
  };

  return (
    <div className="container pb-5">
      <div className="row mb-4">
        <div className="col-md-8 mx-auto">
          <SearchBox onSearch={handleSearch} initialValue={keyword} />
        </div>
      </div>

      <div className="row">
        <div className="col-md-3">
          <CategoryMenu
            selectedCategory={selectedCategory}
            onSelectCategory={(catId) => setSelectedCategory(catId)}
          />
        </div>

        <div className="col-md-9">
          {loading ? (
            <div className="text-center py-5">Đang tải sản phẩm...</div>
          ) : products.length === 0 ? (
            <div className="alert alert-info text-center">Không tìm thấy sản phẩm nào.</div>
          ) : (
            <>
              {/* Grid 4 cột Desktop, 2 cột Tablet, 1 cột Mobile */}
              <div className="row g-3">
                {products.map((p) => (
                  <div key={p.id} className="col-12 col-sm-6 col-lg-3">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>

              {/* Phân trang */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <div className="btn-group">
                    <button
                      className="btn btn-outline-secondary"
                      disabled={page === 0}
                      onClick={() => handlePageChange(page - 1)}
                    >
                      Trang trước
                    </button>
                    <span className="btn btn-light disabled">
                      Trang {page + 1} / {totalPages}
                    </span>
                    <button
                      className="btn btn-outline-secondary"
                      disabled={page >= totalPages - 1}
                      onClick={() => handlePageChange(page + 1)}
                    >
                      Trang sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;