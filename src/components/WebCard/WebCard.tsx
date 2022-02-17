import React, { Component } from "react";
import "./WebCard.scss";
import { WebCard as WebCardItem } from "../../models/WebCard";
import { Anchor, Button, Card, Group, Image, Progress, Text } from "@mantine/core";
import CreateWebCard from "../CreateWebCard/CreateWebCard";

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
  // Simple,
  Full
}

export default class WebCard extends Component<WebCardProps, WebCardState> {
  constructor(props: WebCardProps) {
    super(props);
    this.state = {
      webCard: props.webCard,
      availability: null,
      availabilityError: null,
      // viewMode: props.viewMode
    };
  }

  public checkSiteAvailability() {
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
      if (typeof this.state.availability !== "boolean") {
        this.checkSiteAvailability();
      }
    }
  }

  displayAvailablity() {
    const hasStatus = typeof this.state.availability === "boolean";
    return (
      <Progress title={hasStatus ? this.state.availabilityError : "Checking availability..."} value={hasStatus ? 100 : 0} color={this.state.availability ? "green" : "red"} />
    )
  }

  render() {
    const webCard = this.state.webCard;

    console.log(this.state);


    if (!webCard) {
      return null;
    }

    switch (this.props.viewMode) {
      case ViewMode.Block:
        return this.viewBlock(webCard);
      // case ViewMode.Simple: // Currently inactive
      //   return this.viewSimple(webCard);
      case ViewMode.Full:
        return this.viewFull(webCard);

      default:
        return this.viewBlock(webCard);
    }
  }

  private viewBlock(webCard: WebCardItem) {
    return <div className="web-card" style={{ width: 340, margin: 'auto' }}>
      <Card shadow="sm" padding="lg">
        {webCard.image ? (<Card.Section
          style={{
            marginBottom: '1rem',
            padding: "4px"
          }}
        >
          <Anchor href={webCard.url} target={webCard.target}>
            <Image fit="contain" src={webCard.image} height={160} alt="Web preview" />
          </Anchor>
        </Card.Section>) : null}

        <Group position="apart" style={{ marginBottom: 5 }}>
          <Text weight={500}>{webCard.title}</Text>
          <CreateWebCard
          updateWebCard={webCard}
          titleText="Update Webcard"
          buttonText="Update"
          onCreate={(webCard) => this.setState({ webCard, availability: null, availabilityError: null })} />
        </Group>

        <Text size="sm" style={{ lineHeight: 1.5 }}>
          {webCard.description}
        </Text>

        <Anchor href={webCard.url} target={webCard.target}>
          <Button variant="light" color="blue" fullWidth style={{ marginTop: 14 }}>
            Go to site
          </Button>
        </Anchor>
        {this.displayAvailablity()}
      </Card>
    </div>;
  }

  private viewSimple(webCard: WebCardItem) {
    return <div className="web-card" style={{ margin: 'auto', maxWidth: "80%", }}>
      <Card shadow="sm" padding="lg">
        <Group>
          {webCard.image ? (<Card.Section style={{
            display: "inline-block",
            width: 160,
          }}>
            <Anchor href={webCard.url} target={webCard.target}>
              <Image fit="contain" src={webCard.image} height={160} alt="Web preview" />
            </Anchor>
          </Card.Section>) : null}


          <Group position="apart" style={{ marginBottom: 5 }} direction="column">
            <Anchor href={webCard.url} target={webCard.target}>
              <Text style={{
                fontSize: "2rem",
              }} weight={500}>{webCard.title}</Text>
            </Anchor>
            <Group position="center" style={{ width: "100%" }}>
              <CreateWebCard updateWebCard={webCard} titleText="Update Webcard" buttonText="Update" onCreate={(webCard) => this.setState({ webCard })} />
            </Group>
          </Group>
        </Group>
        {this.displayAvailablity()}
      </Card>
    </div>;
  }

  private viewFull(webCard: WebCardItem) {
    return <div className="web-card" style={{ width: "90%", margin: 'auto' }}>
      <Card shadow="sm" padding="lg">
        {webCard.image ? (<Card.Section>
          <Anchor href={webCard.url} target={webCard.target}>
            <Image src={webCard.image} height={160} alt="Web preview" />
          </Anchor>
        </Card.Section>) : null}

        <Group position="apart" style={{ marginBottom: 5 }}>
          <Text weight={500} style={{
            fontSize: "2rem",
          }}>{webCard.title}</Text>
          <CreateWebCard updateWebCard={webCard} titleText="Update Webcard" buttonText="Update" onCreate={(webCard) => this.setState({ webCard })} />
        </Group>

        <Text size="sm" style={{ lineHeight: 1.5 }}>
          {webCard.description}
        </Text>

        <Anchor href={webCard.url} target={webCard.target}>
          <Button variant="light" color="blue" fullWidth style={{ marginTop: 14 }}>
            Go to site
          </Button>
        </Anchor>
        {this.displayAvailablity()}
      </Card>
    </div>;
  }
}

