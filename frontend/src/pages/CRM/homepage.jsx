import React from "react";

export default function EcommerceUI() {
  const categories = [
    { name: "All Products", active: true },
    { name: "Electronics", active: false },
    { name: "Fashion", active: false },
    { name: "Groceries", active: false },
    { name: "Home & Living", active: false },
    { name: "Sports", active: false },
    { name: "Beauty", active: false },
  ];

  const eventProducts = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 79.99,
      originalPrice: 122.99,
      discount: 40,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    },
    {
      id: 2,
      name: "Organic Fresh Vegetables Bundle",
      price: 24.99,
      originalPrice: 34.99,
      discount: 30,
      image:
        "https://images.unsplash.com/photo-1591206369811-4eeb2f18e6e2?w=500&h=500&fit=crop",
    },
    {
      id: 3,
      name: "Designer Fashion Clothing",
      price: 89.99,
      originalPrice: 149.99,
      discount: 40,
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&h=500&fit=crop",
    },
  ];

  const bestSellerProducts = [
    {
      id: 4,
      name: "Premium Wireless Headphones",
      price: 79.99,
      originalPrice: 122.99,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    },
    {
      id: 5,
      name: "Organic Fresh Vegetables Bundle",
      price: 24.99,
      originalPrice: 34.99,
      image:
        "https://images.unsplash.com/photo-1591206369811-4eeb2f18e6e2?w=500&h=500&fit=crop",
    },
    {
      id: 6,
      name: "Designer Fashion Clothing",
      price: 89.99,
      originalPrice: 149.99,
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&h=500&fit=crop",
    },
  ];

  const allProducts = [
    {
      id: 7,
      name: "Premium Wireless Headphones",
      price: 79.99,
      originalPrice: 122.99,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    },
    {
      id: 8,
      name: "Organic Fresh Vegetables Bundle",
      price: 24.99,
      originalPrice: 34.99,
      image:
        "https://images.unsplash.com/photo-1591206369811-4eeb2f18e6e2?w=500&h=500&fit=crop",
    },
    {
      id: 9,
      name: "Designer Fashion Clothing",
      price: 89.99,
      originalPrice: 149.99,
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&h=500&fit=crop",
    },
    {
      id: 10,
      name: "Smart Watch Series 7",
      price: 299.99,
      originalPrice: 399.99,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
    },
    {
      id: 11,
      name: "Professional Camera",
      price: 899.99,
      originalPrice: 1199.99,
      image:
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=500&fit=crop",
    },
    {
      id: 12,
      name: "Leather Backpack",
      price: 69.99,
      originalPrice: 99.99,
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
    },
    {
      id: 13,
      name: "Running Shoes",
      price: 119.99,
      originalPrice: 159.99,
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
    },
    {
      id: 14,
      name: "Skincare Set",
      price: 49.99,
      originalPrice: 79.99,
      image:
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop",
    },
    {
      id: 15,
      name: "Coffee Maker",
      price: 89.99,
      originalPrice: 129.99,
      image:
        "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&h=500&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banner */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="relative rounded-2xl bg-black text-white py-12 text-center">
          <span className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-600 px-4 py-1 text-sm rounded-full">
            Limited Time Offer
          </span>
          <h1 className="text-4xl font-bold mt-6">Spring Sale Event</h1>
          <p className="mt-2 text-lg opacity-90">
            Up to 40% OFF on selected items
          </p>
        </div>
      </div>

      {/* Event Promotion */}
      <Section title="Event Promotion">
        <Grid>
          {eventProducts.map((p) => (
            <Card key={p.id}>
              <div className="relative">
                <img
                  src={p.image}
                  className="h-56 w-full object-cover"
                  alt=""
                />
                <span className="absolute top-3 left-3 bg-red-600 text-white px-2 py-0.5 text-xs rounded-md font-semibold">
                  {p.discount}% OFF
                </span>
              </div>
              <CardBody
                name={p.name}
                price={p.price}
                original={p.originalPrice}
              />
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Best Seller */}
      <Section title="Best Seller">
        <Grid>
          {bestSellerProducts.map((p) => (
            <Card key={p.id}>
              <img
                src={p.image}
                className="h-56 w-full object-cover"
                alt=""
              />
              <CardBody
                name={p.name}
                price={p.price}
                original={p.originalPrice}
              />
            </Card>
          ))}
        </Grid>
      </Section>

      {/* All Products */}
      <div className="max-w-7xl mx-auto px-4 mt-10 pb-10">
        <h2 className="text-2xl font-semibold mb-6">All Products</h2>

        <div className="bg-white rounded-xl p-6 mb-8 flex flex-wrap gap-3">
          {categories.map((c, i) => (
            <button
              key={i}
              className={`px-6 py-2 rounded-full text-sm font-medium ${
                c.active
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 text-gray-600"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allProducts.map((p) => (
            <Card key={p.id}>
              <img
                src={p.image}
                className="h-64 w-full object-cover"
                alt=""
              />
              <CardBody
                name={p.name}
                price={p.price}
                original={p.originalPrice}
              />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Reusable components */

function Section({ title, children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <a href="#" className="text-blue-600 text-sm font-medium">
          View All →
        </a>
      </div>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      {children}
    </div>
  );
}

function CardBody({ name, price, original }) {
  return (
    <div className="p-3">
      <h3 className="text-sm font-semibold mb-1 line-clamp-2">
        {name}
      </h3>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold">${price}</span>
        <span className="text-xs text-gray-500 line-through">
          ${original}
        </span>
      </div>
    </div>
  );
}
