import React from "react";
import "./App.scss";
import CreateWebCard from "./components/CreateWebCard/CreateWebCard";
import { Affix, Alert, Button, Center, Group, Loader, MantineProvider, Slider, Text, Transition } from "@mantine/core";
import CustomTitle from "./components/CustomTitle/CustomTitle";
import { WebCard as WebCardItem } from "./models/WebCard";
import WebCard, { ViewMode } from "./components/WebCard/WebCard";
import Api from "./api/Api";
import { isEditMode, toggleEditMode } from "./helper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import fontAwesome from "@fortawesome/fontawesome";
import { faCheck, faPen } from "@fortawesome/free-solid-svg-icons";
import { Footer } from "./components/Footer/Footer";

fontAwesome.library.add(faCheck as any, faPen as any);

const editMode = isEditMode();
let isMemoryMode: boolean;

Api.Docker.isDocker().then(c => {
  console.log(c);
});

function App() {
  const [__upd, _update] = React.useState(0);
  const update = () => _update(__upd + 1);

  if (isMemoryMode === undefined) {
    isMemoryMode = null; // So it only runs once
    Api.getConfig<"sqlite">().then(config => {
      // console.log(config);
      isMemoryMode = (config?.__defaultConfig === true)
      update();
    });
  }

  const [webCards, setWebCards] = React.useState<WebCardItem[]>(null);
  const [view, setView] = React.useState<ViewMode>(+window.localStorage.getItem("view") ?? ViewMode.Block);

  if (!webCards) {
    Api.getWebCards().then(webCards => {
      setWebCards(webCards);
    });
  }

  const viewValues = Object.entries(ViewMode).filter(([, value]) => typeof value === "number");

  return (
    <MantineProvider theme={{
      colorScheme: "dark",
    }}>
      <div className="main-app">
        <header className="main-app-header">
          <CustomTitle />
          <Group>

            {
              editMode ? (
                <CreateWebCard onCreate={wc => {
                  setWebCards(null);
                }} />
              ) : null
            }
            {/* Button with Edit mode toggle icon */}
            <Button
              className="edit-mode-toggle"
              color={editMode ? "green" : null}
              title={editMode ? "Exit edit mode" : "Enter edit mode"}
              onClick={() => {
                toggleEditMode();
              }}
            >
              <FontAwesomeIcon icon={["fas", editMode ? "check" : "pen"]} />
            </Button>
          </Group>
        </header>
        <Alert hidden={!isMemoryMode} title="No database configured" color="red">
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
        {/* {
          isMemoryMode ? (
          ) : null
        } */}

        <div style={{
          width: `${viewValues.length * 48}px`,
          margin: "32px",
        }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>View mode</Text>
          <Slider
            label={(value) => ViewMode[value]}
            showLabelOnHover={false}
            marks={
              viewValues.map(([key, value]) => ({ value: value as number, label: key }))
            }
            min={0}
            max={viewValues.length - 1}
            value={view}
            onChange={(value) => {
              window.localStorage.setItem("view", value.toString());
              setView(value as ViewMode);
            }}
          />
        </div>
        <br />
        <Group position="left" >
          {webCards ? webCards.map(webCard => (
            <WebCard key={webCard.id} webCard={webCard} viewMode={view} />
          )) : <Loader />}
        </Group>

        <Footer />

      </div>
    </MantineProvider>
  );
}

export default App;
