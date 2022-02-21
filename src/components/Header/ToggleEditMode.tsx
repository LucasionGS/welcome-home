import React from "react";
import { Button } from "@mantine/core";
import { toggleEditMode } from "../../helper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { editMode } from "./Header";
import fontAwesome from "@fortawesome/fontawesome";
import { faCheck, faPen } from "@fortawesome/free-solid-svg-icons";

fontAwesome.library.add(faCheck as any, faPen as any);

export function ToggleEditMode() {
  return <Button
    className="edit-mode-toggle"
    color={editMode ? "green" : null}
    title={editMode ? "Exit edit mode" : "Enter edit mode"}
    onClick={() => {
      toggleEditMode();
    }}
  >
    <FontAwesomeIcon icon={["fas", editMode ? "check" : "pen"]} />
  </Button>;
}
