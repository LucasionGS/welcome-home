import React from "react";
import "./App.scss";
import CreateWebCard from "./components/CreateWebCard/CreateWebCard";
import { Affix, Anchor, Button, Center, Container, Group, Loader, MantineProvider, Slider, Text, Transition } from "@mantine/core";
import CustomTitle from "./components/CustomTitle/CustomTitle";
import { WebCard as WebCardItem } from "./models/WebCard";
import WebCard, { ViewMode } from "./components/WebCard/WebCard";
import Api from "./api/Api";
import { isEditMode, toggleEditMode } from "./helper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import fontAwesome from "@fortawesome/fontawesome";
import { faCheck, faPen } from "@fortawesome/free-solid-svg-icons";
import { useWindowScroll } from "@mantine/hooks";

fontAwesome.library.add(faCheck as any, faPen as any);

const editMode = isEditMode();

function App() {
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

function Footer() {
  // const [scroll, setScroll] = useWindowScroll();

  return (
    <Container fluid mt={64}>
      <Group grow>
        <Text
          align="left"
          style={{
            color: "white",
          }}
        >
          <Text>Welcome Home™️</Text>
          <Text>
              Developed by <Anchor href="https://github.com/LucasionGS">Lucasion</Anchor>
          </Text>
        </Text>

        <Text
          align="right"
          style={{
            color: "white",
          }}
        >
          <Text>Open Source Project</Text>
          <Anchor href="https://github.com/LucasionGS/welcome-home">
            <Text>Share the GitHub Repository</Text>
          </Anchor>
        </Text>

      </Group>
    </Container>
  )
}

export default App;
