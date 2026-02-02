import React from 'react';
import { Container, Row, Col, Card, Badge, Button, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function EcommerceUI() {
  const categories = [
    { name: 'All Products', active: true },
    { name: 'Electronics', active: false },
    { name: 'Fashion', active: false },
    { name: 'Groceries', active: false },
    { name: 'Home & Living', active: false },
    { name: 'Sports', active: false },
    { name: 'Beauty', active: false }
  ];

  const eventProducts = [
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      price: 79.99,
      originalPrice: 122.99,
      discount: 40,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'
    },
    {
      id: 2,
      name: 'Organic Fresh Vegetables Bundle',
      price: 24.99,
      originalPrice: 34.99,
      discount: 30,
      image: 'https://images.unsplash.com/photo-1591206369811-4eeb2f18e6e2?w=500&h=500&fit=crop'
    },
    {
      id: 3,
      name: 'Designer Fashion Clothing',
      price: 89.99,
      originalPrice: 149.99,
      discount: 40,
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&h=500&fit=crop'
    }
  ];

  const bestSellerProducts = [
    {
      id: 4,
      name: 'Premium Wireless Headphones',
      price: 79.99,
      originalPrice: 122.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'
    },
    {
      id: 5,
      name: 'Organic Fresh Vegetables Bundle',
      price: 24.99,
      originalPrice: 34.99,
      image: 'https://images.unsplash.com/photo-1591206369811-4eeb2f18e6e2?w=500&h=500&fit=crop'
    },
    {
      id: 6,
      name: 'Designer Fashion Clothing',
      price: 89.99,
      originalPrice: 149.99,
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&h=500&fit=crop'
    }
  ];

  const allProducts = [
    {
      id: 7,
      name: 'Premium Wireless Headphones',
      price: 79.99,
      originalPrice: 122.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'
    },
    {
      id: 8,
      name: 'Organic Fresh Vegetables Bundle',
      price: 24.99,
      originalPrice: 34.99,
      image: 'https://images.unsplash.com/photo-1591206369811-4eeb2f18e6e2?w=500&h=500&fit=crop'
    },
    {
      id: 9,
      name: 'Designer Fashion Clothing',
      price: 89.99,
      originalPrice: 149.99,
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&h=500&fit=crop'
    },
    {
      id: 10,
      name: 'Smart Watch Series 7',
      price: 299.99,
      originalPrice: 399.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop'
    },
    {
      id: 11,
      name: 'Professional Camera',
      price: 899.99,
      originalPrice: 1199.99,
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=500&fit=crop'
    },
    {
      id: 12,
      name: 'Leather Backpack',
      price: 69.99,
      originalPrice: 99.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop'
    },
    {
      id: 13,
      name: 'Running Shoes',
      price: 119.99,
      originalPrice: 159.99,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop'
    },
    {
      id: 14,
      name: 'Skincare Set',
      price: 49.99,
      originalPrice: 79.99,
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop'
    },
    {
      id: 15,
      name: 'Coffee Maker',
      price: 89.99,
      originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&h=500&fit=crop'
    }
  ];

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Banner */}
      <Container className="mt-4">
        <div
          style={{
            backgroundColor: '#000',
            borderRadius: '15px',
            padding: '3rem 2rem',
            textAlign: 'center',
            color: 'white',
            position: 'relative'
          }}
        >
          <Badge
            bg="danger"
            style={{
              position: 'absolute',
              top: '1.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              borderRadius: '20px'
            }}
          >
            Limited Time Offer
          </Badge>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '1rem' }}>
            Spring Sale Event
          </h1>
          <p style={{ fontSize: '1.1rem', marginTop: '0.5rem', opacity: 0.9 }}>
            Up to 40% OFF on selected items
          </p>
        </div>
      </Container>

      {/* Event Promotion Section */}
      <Container className="mt-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
            Event Promotion
          </h2>
          <a
            href="#"
            style={{
              color: '#0d6efd',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}
          >
            View All →
          </a>
        </div>

        <Row className="g-4">
          {eventProducts.map((product) => (
            <Col key={product.id} xs={12} md={6} lg={4}>
              <Card style={{ border: 'none', borderRadius: '12px', overflow: 'hidden', height: '100%' }}>
                <div style={{ position: 'relative' }}>
                  <Card.Img
                    variant="top"
                    src={product.image}
                    style={{ height: '300px', objectFit: 'cover' }}
                  />
                  <Badge
                    bg="danger"
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      padding: '0.5rem 0.8rem',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      borderRadius: '8px'
                    }}
                  >
                    {product.discount}% OFF
                  </Badge>
                </div>
                <Card.Body>
                  <Card.Title style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.8rem' }}>
                    {product.name}
                  </Card.Title>
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#000' }}>
                      ${product.price}
                    </span>
                    <span
                      style={{
                        fontSize: '1rem',
                        color: '#6c757d',
                        textDecoration: 'line-through'
                      }}
                    >
                      ${product.originalPrice}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Best Seller Section */}
      <Container className="mt-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
            Best Seller
          </h2>
          <a
            href="#"
            style={{
              color: '#0d6efd',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}
          >
            View All →
          </a>
        </div>

        <Row className="g-4">
          {bestSellerProducts.map((product) => (
            <Col key={product.id} xs={12} md={6} lg={4}>
              <Card style={{ border: 'none', borderRadius: '12px', overflow: 'hidden', height: '100%' }}>
                <Card.Img
                  variant="top"
                  src={product.image}
                  style={{ height: '300px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <Card.Title style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.8rem' }}>
                    {product.name}
                  </Card.Title>
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#000' }}>
                      ${product.price}
                    </span>
                    <span
                      style={{
                        fontSize: '1rem',
                        color: '#6c757d',
                        textDecoration: 'line-through'
                      }}
                    >
                      ${product.originalPrice}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* All Products Section */}
      <Container className="mt-5 pb-5">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
          All Products
        </h2>

        {/* Category Filter */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <Nav className="gap-2 flex-wrap">
            {categories.map((category, index) => (
              <Nav.Item key={index}>
                <Button
                  variant={category.active ? 'primary' : 'outline-secondary'}
                  style={{
                    borderRadius: '20px',
                    padding: '0.5rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}
                >
                  {category.name}
                </Button>
              </Nav.Item>
            ))}
          </Nav>
        </div>

        {/* Products Grid */}
        <Row className="g-4">
          {allProducts.map((product) => (
            <Col key={product.id} xs={12} sm={6} md={4} lg={3}>
              <Card style={{ border: 'none', borderRadius: '12px', overflow: 'hidden', height: '100%' }}>
                <Card.Img
                  variant="top"
                  src={product.image}
                  style={{ height: '250px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <Card.Title style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.8rem' }}>
                    {product.name}
                  </Card.Title>
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#000' }}>
                      ${product.price}
                    </span>
                    <span
                      style={{
                        fontSize: '0.9rem',
                        color: '#6c757d',
                        textDecoration: 'line-through'
                      }}
                    >
                      ${product.originalPrice}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}