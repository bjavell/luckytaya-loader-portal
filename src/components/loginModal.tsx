import React, { useState } from "react";
import Modal from "./modal";
import Form from "./form";
import LoadingSpinner from "./loadingSpinner";
import FormField from "./formField";
import Image from "next/image";
import logo from '@/assets/images/logo-1.svg'
import Button from "./button";

function LoginModal({ onHandleSubmit ,isModalOpen,closeModal} : any) {
  const [isLoading, setIsLoading] = useState(false);

  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  return (
    <Modal size="medium" isOpen={isModalOpen} onClose={closeModal}>
      <Form
        className="w-100 flex flex-col gap-4 justify-center"
      >
        <h1 className="text-2xl">Enter Username & Password</h1>
        {isLoading ? <LoadingSpinner /> : null}
        <Image
          src={logo}
          alt=""
          className="block lg:hidden m-auto"
          priority={false}
        />
        <FormField
          name="userId"
          label="User ID"
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
          }}
          required
        />
        <FormField
          name="password"
          label="Password"
          placeholder="******"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          required
        />
        <Button
          onClick={()=>onHandleSubmit(userId,password)}
          isLoading={isLoading}
          loadingText="Loading..."
          type={"button"}
        >
          Login
        </Button>
        {errorMessage !== "" ? (
          <div className="flex gap-2 text-white bg-red p-4 rounded-xlg">
            {errorMessage}
          </div>
        ) : (
          ""
        )}
      </Form>
    </Modal>
  );
}

export default LoginModal;
