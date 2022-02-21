import React from "react";
import "./Header.scss";
import { Alert, Button, Group } from "@mantine/core";
import CustomTitle from "../../components/CustomTitle/CustomTitle";
import Api from "../../api/Api";
import { isEditMode } from "../../helper";
import { ToggleEditMode } from "./ToggleEditMode";

interface HeaderProps {
  items?: React.ReactNode[];
}

export const editMode = isEditMode();


export default function Header(props: HeaderProps) {
  const [showMemoryMode, setShowMemoryMode] = React.useState<boolean>();

  if (showMemoryMode === undefined) {
    setShowMemoryMode(null);
    Api.getConfig<"sqlite">().then(config => {
      console.log(config);
      setShowMemoryMode(config?.__defaultConfig === true);
    });
  }
  return (
    <>
      <header className="main-app-header">
        <CustomTitle />
        <Group>
          {
            props.items
          }
          <ToggleEditMode />
        </Group>
      </header>
      <Alert hidden={!showMemoryMode} title="No database configured" color="red">
        No database has been configured. Go to setup to config the server to have your changes persist.
        <Group>
          <Button
            color="green"
            onClick={() => {
              window.location.href = "/setup";
            }}
          >Setup</Button>
        </Group>
      </Alert>
    </>
  )
}

