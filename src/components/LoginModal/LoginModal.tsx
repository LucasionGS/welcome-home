import { Button, Group, Modal, PasswordInput, TextInput } from "@mantine/core";
import React from "react";
import "./LoginModal.scss";

interface LoginModalProps { }

export default function LoginModal(props: LoginModalProps) {
  const [opened, setOpened] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  
  const ref = {
    username: React.useRef<HTMLInputElement>(),
    password: React.useRef<HTMLInputElement>(),
  };

  function handleSubmit() {
    setLoading(true);
    const [
      username,
      password,
    ] = [
      ref.username.current.value,
      ref.password.current.value,
    ];

    // Login
  }
  
  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)}>
        <div className="login-modal">
          <h2>Login</h2>
          <Group direction="column">
            <TextInput label="Username" ref={ref.username} required />
            <PasswordInput label="Password" ref={ref.password} required />
            
            <Button type="submit" onClick={handleSubmit}>Login</Button>
          </Group>
        </div>
      </Modal>
    </>
  )
}
