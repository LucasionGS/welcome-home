import React from "react";
import CreateWebCard from "../../../components/CreateWebCard/CreateWebCard";
import { Group, Loader, Select, Text } from "@mantine/core";
import { WebCard as WebCardItem, WebCardCategory } from "../../../models/WebCard";
import WebCard, { ViewMode } from "../../../components/WebCard/WebCard";
import Api from "../../../api/Api";
import fontAwesome from "@fortawesome/fontawesome";
import { faCheck, faPen } from "@fortawesome/free-solid-svg-icons";
import { editMode } from "../../Header/Header";

fontAwesome.library.add(faCheck as any, faPen as any);

function WebcardsView() {
  const [webCards, setWebCards] = React.useState<WebCardItem[]>(null);
  const [view, setView] = React.useState<ViewMode>(+window.localStorage.getItem("view") ?? ViewMode.Block);

  if (!webCards) {
    Api.getWebCards().then(webCards => {
      setWebCards(webCards);
    });
  }

  const [isDocker, setIsDocker] = React.useState(null);
  if (isDocker === null) {
    Api.Docker.isDocker().then(c => {
      setIsDocker(c.docker);
    });
  }

  const viewValues = Object.entries(ViewMode).filter(([, value]) => typeof value === "number");

  const categorized: WebCardCategory[] = [];

  if (webCards) {
    const categories = new Set(webCards.map(c => c.category));
    categories.forEach(c => {
      categorized.push({
        category: c,
        webcards: webCards.filter(w => w.category === c)
      });
    });
  }


  return (
    <>
      <div style={{
        width: `fit-content`,
        margin: "8px 32px"
      }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>View mode</Text>
        <Select
          data={
            viewValues.map(([key, value]) => ({ value: value.toString() as string, label: key }))
          }
          value={view.toString()}
          onChange={(value) => {
            window.localStorage.setItem("view", value);
            setView(+value);
          }}
        />
        {
          editMode && <CreateWebCard />
        }
      </div>
      <br />
      {
        webCards ?
          (
            <Group position="center" direction={view === ViewMode.Simple ? "row" : "column"}>
              {categorized.map(c => (
                <Group key={c.category} direction="column" grow>
                  <Text style={{ fontSize: 32, color: "white", textAlign: "center" }}>{c.category}</Text>
                  <Group key={c.category} direction={view === ViewMode.Simple ? "column" : "row"}>
                    {
                      c.webcards.map(w => (
                        <WebCard key={w.id} webCard={w} viewMode={view} />
                      ))
                    }
                  </Group>
                </Group>
              ))}
            </Group>
          ) : <Loader />
      }
    </>
  );
}

export default WebcardsView;
