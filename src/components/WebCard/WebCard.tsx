import React, { Component } from "react";
import "./WebCard.scss";
import { WebCard as WebCardItem } from "../../models/WebCard";
import { Anchor, Button, Card, Group, Image, Progress, Spoiler, Text } from "@mantine/core";
import CreateWebCard from "../CreateWebCard/CreateWebCard";
import { isEditMode, showInEditMode } from "../../helper";
import htmlParser from "react-html-parser";
import Api from "../../api/Api";

interface WebCardProps {
  webCard: WebCardItem;
  viewMode: ViewMode;
}
interface WebCardState {
  webCard: WebCardItem;
  availability: boolean;
  availabilityError: string;
  // viewMode: ViewMode;
}

export enum ViewMode {
  Block,
  Simple,
  // List,
  // Full,
}

const editMode = isEditMode();

export default class WebCard extends Component<WebCardProps, WebCardState> {
  constructor(props: WebCardProps) {
    super(props);
    this.state = {
      webCard: props.webCard,
      availability: undefined,
      availabilityError: null,
      // viewMode: props.viewMode
    };
  }

  public checkSiteAvailability() {
    if (this.state.availability === null) {
      return;
    }
    
    if (!this.state.webCard.checkAvailable) {
      return this.setState({ availability: null, availabilityError: null });
    }
    this.setState({ availability: null, availabilityError: "Fetching..." });
    const url = this.state.webCard.url;
    if (url) {
      fetch(url, {
        method: "HEAD",
        mode: "no-cors",
        redirect: "follow",
        referrer: "no-referrer",
      }).then(response => {
        if (response.status === 200 || response.status === 0) {
          this.setState({ availability: true, availabilityError: null });
        } else {
          this.setState({
            availability: false,
            availabilityError: response.statusText
          });
        }
      }).catch((err) => {
        this.setState({
          availability: false,
          availabilityError: err ? err.message : "Could not connect to the site"
        });
      });
    }
  }


  interval: NodeJS.Timer;
  componentDidMount(): void {
    this.checkSiteAvailability();

    this.interval = setInterval(() => {
      this.checkSiteAvailability();
    }, 1000 * 60);
  }

  componentWillUnmount(): void {
    clearInterval(this.interval);
  }

  componentDidUpdate(prevProps: Readonly<WebCardProps>, prevState: Readonly<WebCardState>, snapshot?: any): void {
    if (this.state.webCard && prevState.webCard) {
      if (this.state.availability === undefined) {
        this.checkSiteAvailability();
      }
    }
  }

  displayAvailablity() {
    if (this.state.availability === null && this.state.availabilityError === null) {
      return null;
    }
    const hasStatus = typeof this.state.availability === "boolean";
    return (
      <Progress
        title={hasStatus ? this.state.availabilityError : "Checking availability..."}
        value={hasStatus ? 100 : 33}
        color={this.state.availability ? "green" : "red"}
        animate={hasStatus}
      />
    )
  }

  parseDescription() {
    if (this.state.webCard) {
      return htmlParser(this.state.webCard.description, {
        transform: (node, index) => {
          if (node.type === "tag") {
            if (node.name === "a") {
              return (
                <Anchor href={node.attribs.href}>{node.children[0].data}</Anchor>
              );
            }
          }
        }
      }) as React.ReactNode;
    }
    return null;
  }

  getImageUrl() {
    const url = this.state.webCard?.image;
    if (url?.startsWith("/uploads")) {
      return `${Api.baseUrl}${url}`;
    }
    return url;
  }

  render() {
    const webCard = this.state.webCard;

    if (!webCard) {
      return null;
    }

    switch (this.props.viewMode) {
      case ViewMode.Simple:
        return this.viewSimple(webCard) as JSX.Element;
      default:
        return this.viewBlock(webCard) as JSX.Element;
    }
  }

  private viewSimple(webCard: WebCardItem) {
    const availability = this.displayAvailablity();

    const card = (openModal?: () => void) => (
      <div className="web-card" style={{ margin: 'auto', maxWidth: "80%", width: "420px", }}>
        <Card shadow="sm" padding="lg"
          onClick={(e: any) => {
            if (openModal) {
              e.preventDefault();
              openModal();
            }
          }}
        >
          <Group style={{
            width: "100%",
            // minHeight: "20%",
          }}>

            {/* <Anchor href={webCard.url} target={webCard.target}> */}
            <Card.Section style={{
              display: "inline-block",
              width: "100%",
              height: "100%",
              backgroundColor: webCard.image ? undefined : "#f5f5f50f",
              borderRadius: 5,
            }}>
              <Group direction="column">
                <div style={{
                  color: "inherit",
                  position: "relative"
                }}>
                  <Anchor href={webCard.url} target={webCard.target} style={{
                    color: "inherit",
                  }}>
                    {webCard.image ? (
                      <Image fit="contain" src={this.getImageUrl()} alt={webCard.title + " icon"} style={{
                        width: "64px",
                        height: "64px",
                        display: "inline-block",
                        borderRadius: 10,
                        overflow: "hidden",
                      }} />
                    ) : null}
                    <div style={{
                      display: "inline-block",
                      width: "100%",
                      height: "100%",
                      top: "50%",
                      left: "calc(25% + 64px)",
                      position: "absolute",
                    }}>
                      <Text style={{
                        fontSize: "1.3rem",
                        display: "inline-block",
                        transform: "translateY(-50%)",
                      }} weight={400}>
                        {webCard.title}
                      </Text>
                    </div>
                  </Anchor>
                </div>
              </Group>
            </Card.Section>
            {/* </Anchor> */}
          </Group>
          {availability ? (<>
            <br />
            {availability}
          </>) : null}
        </Card>
      </div>
    );

    return showInEditMode(
      <CreateWebCard
        component={om => card(om)}

        fullWidth
        updateWebCard={webCard}
        titleText="Update Webcard"
        buttonText="Update"
        onCreate={(webCard) => this.setState({ webCard, availability: undefined, availabilityError: null })}
      />,
      card()
    )
  }

  private viewBlock(webCard: WebCardItem) {

    const card = (openModal?: () => void) => (
      <div className="web-card" style={{ width: 340, margin: 'auto' }}>
        <Card shadow="sm" padding="lg" style={{ width: 340, minHeight: 300 }}
          onClick={(e: any) => {
            if (openModal) {
              e.preventDefault();
              openModal();
            }
          }}
        >
          <Anchor href={webCard.url} target={webCard.target}
            style={{
              color: "inherit",
              textDecoration: "none",
            }}

          >
            <Card.Section
              style={{
                marginBottom: '1rem',
                height: 160,
                backgroundColor: webCard.image ? undefined : "#f5f5f50f",
                borderRadius: 5,
                overflow: "hidden",
              }}
            >
              {webCard.image ? (
                <Image fit="contain" src={this.getImageUrl()} height={160} alt="Web preview" style={{
                  borderRadius: 10,
                  overflow: "hidden",
                }} />
              ) : null}
            </Card.Section>

            <Group position="apart" style={{ marginBottom: 5 }}>
              <Text
                align="center"
                style={{
                  fontSize: '1.5rem',
                  width: "100%"
                }} weight={500}
              >{webCard.title}</Text>
            </Group>
          </Anchor>


          <Spoiler maxHeight={48} showLabel="Expand" hideLabel="Collapse" style={{
            minHeight: "4.8rem",
          }}>
            <Text size="sm" style={{ minHeight: 48, lineHeight: 1 }}>
              <div className="web-card-description" style={{
                paddingBottom: "0.4rem",
              }}>
                {this.parseDescription()}
              </div>
            </Text>
          </Spoiler>

          {/* {
          editMode ? (
            <CreateWebCard
              fullWidth
              updateWebCard={webCard}
              titleText="Update Webcard"
              buttonText="Update"
              onCreate={(webCard) => this.setState({ webCard, availability: undefined, availabilityError: null })} />
          )
            :
            (<Anchor href={webCard.url} target={webCard.target}>
              <Button variant="light" color="blue" fullWidth style={{ marginTop: 14 }}>
                Go to site
              </Button>
            </Anchor>)
        } */}
          {this.displayAvailablity()}
        </Card>
      </div>
    );

    return showInEditMode(
      <CreateWebCard
        component={openModal => card(openModal)}
        fullWidth
        updateWebCard={webCard}
        titleText="Update Webcard"
        buttonText="Update"
        onCreate={(webCard) => this.setState({ webCard, availability: undefined, availabilityError: null })}
      />,
      card()
    );
  }
}

