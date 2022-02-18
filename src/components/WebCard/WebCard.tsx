import React, { Component } from "react";
import "./WebCard.scss";
import { WebCard as WebCardItem } from "../../models/WebCard";
import { Anchor, Button, Card, Group, Image, Progress, Spoiler, Text } from "@mantine/core";
import CreateWebCard from "../CreateWebCard/CreateWebCard";
import { isEditMode } from "../../helper";
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
  List,
  Full,
  Simple,
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
    console.log("Checking availability...");

    if (this.state.availability === null) {
      return;
    }
    if (!this.state.webCard.checkAvailable) {
      return this.setState({ availability: null, availabilityError: null });
    }
    const url = this.state.webCard.url;
    if (url) {
      fetch(url, {
        method: "HEAD",
        mode: "no-cors",
        redirect: "follow",
        referrer: "no-referrer",
      }).then(response => {
        if (response.status === 200 || response.status === 0) {
          this.setState({ availability: true });
        } else {
          this.setState({
            availability: false,
            availabilityError: response.statusText
          });
        }
      }).catch(() => {
        this.setState({
          availability: false,
          availabilityError: "Could not connect to the site"
        });
      });
    }
  }

  componentDidMount(): void {
    this.checkSiteAvailability();
  }

  componentDidUpdate(prevProps: Readonly<WebCardProps>, prevState: Readonly<WebCardState>, snapshot?: any): void {
    if (this.state.webCard && prevState.webCard) {
      if (this.state.availability === undefined) {
        this.checkSiteAvailability();
      }
    }
  }

  displayAvailablity() {
    if (this.state.availability === null) {
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
      });
    }
    return null;
  }

  getImageUrl() {
    const url = this.state.webCard?.image;
    console.log(url, this.state.webCard.title);
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
      case ViewMode.Block:
        return this.viewBlock(webCard);
      case ViewMode.Simple:
        return this.viewSimple(webCard);
      case ViewMode.Full:
        return this.viewFull(webCard);
      case ViewMode.List:
        return this.viewList(webCard);
      default:
        return this.viewBlock(webCard);
    }
  }

  private viewBlock(webCard: WebCardItem) {
    return <div className="web-card" style={{ width: 340, margin: 'auto' }}>
      <Card shadow="sm" padding="lg" style={{ width: 340, minHeight: 375 }}>
        <Anchor href={webCard.url} target={webCard.target}>
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
              <Image fit="contain" src={this.getImageUrl()} height={160} alt="Web preview" />
            ) : null}
          </Card.Section>
        </Anchor>

        <Group position="apart" style={{ marginBottom: 5 }}>
          <Text style={{
            fontSize: '1.5rem',
          }} weight={500}>{webCard.title}</Text>
        </Group>

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

        {
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
        }
        {this.displayAvailablity()}
      </Card>
    </div>;
  }

  private viewSimple(webCard: WebCardItem) {
    return <div className="web-card" style={{ margin: 'auto', maxWidth: "80%", }}>
      <Card shadow="sm" padding="lg">
        <Group>
          <Anchor href={webCard.url} target={webCard.target}>
            <Card.Section style={{
              display: "inline-block",
              width: 160,
              height: 160,
              backgroundColor: webCard.image ? undefined : "#f5f5f50f",
              borderRadius: 5,
              overflow: "hidden",
            }}>
              {webCard.image ? (
                <Image fit="contain" src={this.getImageUrl()} height={160} alt="Web preview" />
              ) : null}
            </Card.Section>
          </Anchor>

          <Group position="apart" style={{ marginBottom: 5 }} direction="column">
            <Anchor href={webCard.url} target={webCard.target}>
              <Text style={{
                fontSize: "2rem",
              }} weight={500}>{webCard.title}</Text>
            </Anchor>
            {
              editMode ? (
                <Group position="center" style={{ width: "100%" }}>
                  <CreateWebCard
                    fullWidth
                    updateWebCard={webCard}
                    titleText="Update Webcard"
                    buttonText="Update"
                    onCreate={(webCard) => this.setState({ webCard, availability: undefined, availabilityError: null })}
                  />
                </Group>
              )
                : null
            }
          </Group>
        </Group>
        {this.displayAvailablity()}
      </Card>
    </div>;
  }

  private viewFull(webCard: WebCardItem) {
    return <div className="web-card" style={{ width: "90%", margin: 'auto' }}>
      <Card shadow="sm" padding="lg">
        <Anchor style={{
          display: "block",
          padding: 0,
          margin: 0,
        }} href={webCard.url} target={webCard.target}>
          <Card.Section style={{
            height: 160,
            backgroundColor: webCard.image ? undefined : "#f5f5f50f",
            borderRadius: 5,
            overflow: "hidden",
          }}>
            {webCard.image ? (
              <Image src={this.getImageUrl()} height={160} alt="Web preview" />
            ) : null}
          </Card.Section>
        </Anchor>

        <Group position="apart" style={{ marginBottom: 5 }}>
          <Text weight={500} style={{
            fontSize: "2rem",
          }}>{webCard.title}</Text>
        </Group>

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

        {
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
        }
        {this.displayAvailablity()}
      </Card>
    </div>;
  }

  private viewList(webCard: WebCardItem) {
    return <div className="web-card" style={{ width: "45%", margin: 'auto' }}>
      <Card shadow="sm" padding="lg">
        <Anchor href={webCard.url} target={webCard.target}>
          <Card.Section style={{
            height: 160,
            backgroundColor: webCard.image ? undefined : "#f5f5f50f",
            borderRadius: 5,
            overflow: "hidden",
          }}>
            {webCard.image ? (
              <Image src={this.getImageUrl()} height={160} alt="Web preview" />
            ) : null}
          </Card.Section>
        </Anchor>

        <Group position="apart" style={{ marginBottom: 5 }}>
          <Text weight={500} style={{
            fontSize: "2rem",
          }}>{webCard.title}</Text>
        </Group>

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

        {
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
        }
        {this.displayAvailablity()}
      </Card>
    </div>;
  }
}

