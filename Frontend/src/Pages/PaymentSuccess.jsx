import { message } from "antd";
import axios from "axios";
import React, { useEffect } from "react";

const PaymentSuccess = () => {
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const transaction_uuid = new URLSearchParams(window.location.search).get(
        "transaction_uuid"
      );

      if (!transaction_uuid) {
        message.error("Transaction UUID not found.");
        return;
      }

      const paymentStatusPayload = {
        product_code: "EPAYTEST", // Your merchant ID
        total_amount: total * 100, // Total amount in paisa (make sure you get this from your state or context)
        transaction_uuid,
      };

      try {
        const response = await axios.get(
          `https://uat.esewa.com.np/api/epay/transaction/status/`,
          { params: paymentStatusPayload }
        );

        if (response.data.status === "COMPLETE") {
          message.success(
            `Payment successful! Transaction ID: ${response.data.ref_id}`
          );
          // Here you can also update your order status in your database or perform other actions.
        } else {
          message.error(`Payment failed. Status: ${response.data.status}`);
        }
      } catch (error) {
        console.error(
          "Error checking payment status:",
          error.response?.data || error.message
        );
        message.error("Failed to check payment status. Please try again.");
      }
    };

    checkPaymentStatus();
  }, []);

  return <div>Checking payment status...</div>;
};

export default PaymentSuccess;
