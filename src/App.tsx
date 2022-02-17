import React from "react";
import "./App.scss";
import CreateWebCard from "./components/CreateWebCard/CreateWebCard";
import { Group, MantineProvider, Slider, Text } from "@mantine/core";
import CustomTitle from "./components/CustomTitle/CustomTitle";
import { WebCard as WebCardItem } from "./models/WebCard";
import WebCard, { ViewMode } from "./components/WebCard/WebCard";
import Api from "./api/Api";

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
          <CreateWebCard onCreate={wc => {
            console.log(wc);
            setWebCards(null);
          }} />
        </header>

        <div style={{
          width: `${viewValues.length * 64}px`,
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
        <Group position="left">
          {webCards ? webCards.map(webCard => (
            <WebCard key={webCard.id} webCard={webCard} viewMode={view} />
          )) : null}
        </Group>
      </div>
    </MantineProvider>
  );
}

export default App;
