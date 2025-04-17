import {
  EnvironmentOutlined,
  SafetyOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import React from "react";

export function FeaturesSection() {
  const features = [
    {
      icon: <EnvironmentOutlined style={{ fontSize: 24, color: "#22c55e" }} />,
      title: "Whole nepal",
      description:
        "Connect with buyers and sellers from around the nepal for seamless agricultural trade.",
    },
    {
      icon: <ShoppingCartOutlined style={{ fontSize: 24, color: "#22c55e" }} />,
      title: "Effortless Transactions",
      description:
        "Simplify buying and selling with secure and transparent payment options.",
    },
    {
      icon: <TeamOutlined style={{ fontSize: 24, color: "#22c55e" }} />,
      title: "Verified Partners",
      description:
        "Work only with verified and trustworthy partners for reliable deals.",
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 24, color: "#22c55e" }} />,
      title: "Data Security",
      description:
        "Your data is protected with state-of-the-art encryption and security measures.",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4 mx-auto">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
            Empowering Agricultural Trade
          </h2>
          <p className="text-lg text-gray-600">
            Discover how Agrotech revolutionizes the B2B agricultural
            marketplace.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 transition-shadow duration-300 bg-white rounded-lg shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                {feature.title}
              </h3>
              <p className="mb-4 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
