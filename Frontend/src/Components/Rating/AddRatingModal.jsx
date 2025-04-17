import { Button, Form, Input, Modal, Rate, message } from "antd"; // Import `message` directly
import axios from "axios";
import React, { useState } from "react";
import { base_url } from "../../url";

export const AddRatingModal = ({ product_id, name }) => {
  const [open, setOpen] = useState(false);

  function handleModal() {
    setOpen(!open);
  }

  async function handleFinish(values) {
    try {
      await axios.post(
        `${base_url}/api/ratings/add`,
        {
          product_id: product_id,
          ...values,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      message.success("Successfully Rated"); // Use `message` directly
      setOpen(false); // Close the modal after successful submission
    } catch (err) {
      console.error(err);
      message.error("You have already rated this product."); // Use `message` directly
    }
  }

  return (
    <div>
      <Button onClick={handleModal}>Rate This Product</Button>
      <Modal
        title={`Rate ${name || "this product."}`}
        footer={null}
        onCancel={handleModal}
        open={open}
      >
        <Form
          layout="vertical"
          requiredMark={"optional"}
          onFinish={handleFinish}
        >
          <Form.Item
            label={"Out of 5"}
            name={"rating"}
            rules={[{ required: true, message: "Please provide a rating!" }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            label="Review"
            name={"review"}
            rules={[{ required: true, message: "Please provide a review!" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <div className="flex items-center justify-center">
            <Button type="primary" htmlType="submit" className="px-10">
              Rate
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
