import React from "react";
import "./App.scss";
import { MantineProvider, Tab, Tabs } from "@mantine/core";
import Api from "./api/Api";
import { isEditMode } from "./helper";
import { Footer } from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import WebcardsView from "./components/View/WebcardsView/WebcardsView";
import ServerStatusView from "./components/View/ServerStatusView/ServerStatusView";

const editMode = isEditMode();
let isMemoryMode: boolean;

function App() {
  const [__upd, _update] = React.useState(0);
  const update = () => _update(__upd + 1);

  if (isMemoryMode === undefined) {
    isMemoryMode = null; // So it only runs once
    Api.getConfig<"sqlite">().then(config => {
      isMemoryMode = (config?.__defaultConfig === true)
      update();
    });
  }

  interface TabContext {
    title: string;
    url: string;
    view: JSX.Element;
  }
  
  const tabs: TabContext[] = [
    // List of webcards
    {
      title: "Webcards",
      url: "webcards",
      view: <WebcardsView />
    },
    // Server status dashboard.
    {
      title: "Status",
      url: "status",
      view: <ServerStatusView />
    }
  ];

  const initialIndex = (() => {
    const cat = window.location.pathname.split("/")[1];
    const index = tabs.findIndex(t => t.url === cat);
    return index === -1 ? 0 : index;
  })();

  return (
    <MantineProvider theme={{
      colorScheme: "dark"
    }}>
      <div className="main-app">
        <Header items={[]} />
        <Tabs initialTab={initialIndex} onTabChange={(i) => {
          // Push to new url
          let url = `/${tabs[i].url}`;
          // Check edit mode
          if (editMode) {
            url += "/edit";
          }
          window.history.pushState({}, "", url);
        }}>
          {
            tabs.map((tab, i) => (
              <Tab title={tab.title} label={tab.title} key={tab.title}>
                {tab.view}
              </Tab>
            ))
          }
        </Tabs>

        <Footer />
      </div>
    </MantineProvider>
  );
}

export default App;
