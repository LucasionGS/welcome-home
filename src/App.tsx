import React, { useState } from "react";
import "./App.scss";
import { MantineProvider, Tab, Tabs } from "@mantine/core";
import Api from "./api/Api";
import { isEditMode } from "./helper";
import { Footer } from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import WebcardsView from "./components/View/WebcardsView/WebcardsView";
import ServerStatusView from "./components/View/ServerStatusView/ServerStatusView";
import FileExplorerView from "./components/View/FileExplorerView/FileExplorerView";
import fontAwesome from "@fortawesome/fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForceUpdate } from "@mantine/hooks";

(fontAwesome.library.add as any)(faPlus);

const editMode = isEditMode();
let isMemoryMode: boolean;

function App() {
  const update = useForceUpdate();
  const [customTabs, setCustomTabs] = useState<TabContext[]>(null);

  if (isMemoryMode === undefined) {
    isMemoryMode = null; // So it only runs once
    Api.getConfig<"sqlite">().then(config => {
      isMemoryMode = (config?.__defaultConfig === true);
      update();
    });
  }

  interface TabContext {
    title: string;
    url: string;
    view: React.ReactNode;
    icon?: React.ReactNode;
    color?: string;
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
    },
    {
      title: "File explorer",
      url: "file-explorer",
      view: <FileExplorerView />
    },
    ...(customTabs || [])  // Add custom tabs
  ];


  // if (!customTabs) {
  //   const _customTabs: TabContext[] = [];
  //   // Fetch custom tabs
  //   // Add an add button to the tabs
  //   if (editMode) {
  //     _customTabs.push({
  //       title: "Add Page",
  //       url: "add-page",
  //       view: <div>
  //         <h2>Not implemented yet</h2>
  //       </div>,
  //       icon: <FontAwesomeIcon icon={faPlus} />,
  //       color: "green"
  //     });
  //   }
  //   setCustomTabs(_customTabs);
  // }

  const initialIndex = (() => {
    const cat = window.location.pathname.split("/")[1];
    const index = tabs.findIndex(t => t.url === cat);
    return index === -1 ? 0 : index;
  })();
  const [tabIndex, setTabIndex] = useState(initialIndex);

  return (
    <MantineProvider theme={{
      colorScheme: "dark"
    }}>
      <div className="main-app">
        <Header items={[]} />
        <Tabs tabIndex={tabIndex} onTabChange={(i) => {
          setTabIndex(i);
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
              <Tab title={tab.title} label={tab.icon ?? tab.title} key={tab.title} color={tab.color}
                style={{
                  color: tab.color
                }}
              >
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
