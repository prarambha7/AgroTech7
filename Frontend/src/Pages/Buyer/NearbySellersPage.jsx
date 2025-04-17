import axios from "axios";
import React, { useEffect, useState } from "react";
import { base_url } from "../../url";

export const NearbySellersPage = () => {
  const [sellers, setSellers] = useState([]);

  async function fetchNearbySellers() {
    try {
      const response = await axios.get(`${base_url}/api/seller/nearby`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log(response.data.data);
      setSellers(response.data.data); // Set the fetched data to the state
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchNearbySellers();
  }, []);

  return (
    <div className="container px-4 py-6 mx-auto">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">Nearby Sellers</h1>
      {sellers.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 min-h-80">
          {sellers.map((seller) => (
            <div
              key={seller.id}
              className="p-4 transition-shadow duration-200 bg-white border rounded-lg shadow-sm hover:shadow-lg"
            >
              <h2 className="text-xl font-semibold text-gray-700">
                {seller.farm_name}
              </h2>
              <p className="text-sm text-gray-500">
                Managed by:{" "}
                <span className="font-medium">{seller.full_name}</span>
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Location: {seller.farm_address}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Distance:{" "}
                <span className="font-medium">
                  {seller.distance.toFixed(2)} km
                </span>
              </p>
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-600">
                  Products:
                </h3>
                {seller.products.length > 0 ? (
                  <div className="">
                    {seller.products.slice(0, 3).map((product) => (
                      <div
                        key={product.id}
                        className="flex gap-2 cursor-pointer"
                      >
                        <p className="text-sm font-medium text-gray-700">
                          {product.name} {"=>"} Price: NPR {product.price},
                          Quantity:
                          {product.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No products available.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No sellers found nearby.</p>
      )}
    </div>
  );
};
