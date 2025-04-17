import { AppstoreOutlined } from "@ant-design/icons";
import axios from "axios";
import React, { useEffect, useState } from "react";

export function ProductCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Function to get categories from API
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/categories"
        );
        setCategories(response.data); // Assuming the response is an array of categories
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4 mx-auto">
        {/* Section Title */}
        <h2 className="mb-12 text-3xl font-bold text-center text-gray-800 md:text-4xl">
          Product Categories
        </h2>

        {/* Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <div
                key={index}
                className="flex flex-col justify-between p-6 transition-shadow duration-300 bg-white rounded-lg shadow-sm hover:shadow-md"
              >
                <div className="flex flex-col items-center">
                  {/* Category Icon */}
                  <div className="flex items-center justify-center w-12 h-12 mb-4 bg-green-100 rounded-lg">
                    <AppstoreOutlined
                      style={{ fontSize: "24px", color: "#22c55e" }}
                    />
                  </div>

                  {/* Category Title */}
                  <h3 className="mb-2 text-xl font-semibold text-gray-800">
                    {category.name}
                  </h3>

                  {/* Category Description */}
                  <p className="mb-4 text-gray-600">
                    Discover a wide range of products under {category.name}.
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-800">
                      Measurement:
                    </span>{" "}
                    {category.uoms
                      .map((item) => String(item).toUpperCase())
                      .join(", ")}
                  </p>
                </div>

                {/* Browse Products Button */}
                {/* <Button
                  type="primary"
                  href={`/products/${category.name
                    .toLowerCase()
                    .replace(/ /g, "-")}`}
                  className="flex items-center"
                >
                  Browse Products
                  <span className="ml-2">→</span>
                </Button> */}
              </div>
            ))
          ) : (
            <div className="text-center col-span-full">
              <p className="text-lg text-gray-600">Loading categories...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
