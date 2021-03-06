import { Button, Loader, Modal } from "@mantine/core";
import React from "react";
import Api from "../../api/Api";
import { isEditMode } from "../../helper";
import "./UpdateModal.scss";

interface UpdateModalProps { }

let uptime = 0;
const editMode = isEditMode();

export default function UpdateModal(props: UpdateModalProps) {
  const [opened, setOpened] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [isDocker, setIsDocker] = React.useState(null);
  if (isDocker === null) {
    Api.Docker.isDocker().then(c => {
      setIsDocker(c.docker);
    });
  }

  async function startUpdate() {
    setLoading(true);
    uptime = (await Api.getUptime()).uptime;
    await Api.Docker.update();

    setInterval(async () => {
      const uptimeToCheck = (await Api.getUptime().then(u => u.uptime).catch(() => null));
      if (uptimeToCheck !== null) {
        if (uptimeToCheck > uptime) {
          uptime = uptimeToCheck;
        }
        else if (uptimeToCheck < uptime) {
          window.location.reload();
        }
      }
    }, 5000);
  }

  return (
    <>
      <Modal
        closeOnClickOutside={false}
        closeOnEscape={false}
        hideCloseButton={true}
        opened={opened}
        onClose={() => setOpened(false)}
      >
        <h2>Rebuild server and UI with the latest update from GitHub</h2>
        {
          loading ? (
            <>
              <p>Please be patient as this could take a little while...</p>
              <p>The browser will refresh automatically when the update is complete.</p>
            </>
          ) : null
        }
        <p>
          <Button disabled={loading} color="red" type="submit" onClick={() => setOpened(false)}>Cancel</Button>
          <Button disabled={loading} loading={loading} type="submit" onClick={() => startUpdate()}>Update</Button>
        </p>
      </Modal>

      {
        editMode ? (
          isDocker === null ? <Loader />
            : isDocker === true ? <Button color="red" onClick={() => setOpened(true)}>Update Server</Button>
              : null
        ) : null
      }
    </>
  )
}
