import { Button, Modal } from "antd";
import { motion } from "framer-motion";
import { useState } from "react";
import { setGlobalState } from "../../Hook/GlobalHook";

export const LogoutModal = () => {
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  function handleChange() {
    setOpenLogoutModal(!openLogoutModal);
  }
  function handleLogout() {
    setGlobalState("loading", true);
    handleChange();
    setGlobalState("isLoggedIn", false);
    setGlobalState("userData", () => {
      return {
        email: "",
        name: "",
        role: "",
        userId: "",
        username: "",
      };
    });
    setGlobalState("token", "");
    localStorage.clear();
    setGlobalState("loading", false);
  }
  return (
    <div className="w-full font-Inter">
      <div
        onClick={handleChange}
        className="flex flex-row justify-start items-center gap-3  "
      >
        Logout
      </div>

      <Modal
        width={340}
        footer={null}
        open={openLogoutModal}
        onCancel={handleChange}
        onOk={handleLogout}
        closable={false}
      >
        <div className="flex flex-col font-Inter ">
          <h1 className="text-2xl font-bold mb-6 text-center  ">Logout?</h1>
          <div className="flex gap-8 justify-center items-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleChange}
              className="p-0 m-0 rounded-xl border-none"
            >
              <Button className="px-9  text-md">No</Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              className="p-0 m-0 rounded-xl  border-none"
            >
              <Button type="primary" danger className="px-10 text-md">
                Yes
              </Button>
            </motion.div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
