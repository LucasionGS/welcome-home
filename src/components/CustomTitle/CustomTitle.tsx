import { Button, Group, Modal, Text, TextInput } from "@mantine/core";
import React, { Component } from "react";
import Api from "../../api/Api";
import "./CustomTitle.scss";

interface CustomTitleProps { }
interface CustomTitleState {
  title: string;
  opened: boolean;
  loading: boolean;
}

export default class CustomTitle extends Component<CustomTitleProps, CustomTitleState> {
  constructor(props: CustomTitleProps) {
    super(props);
    this.state = {
      title: localStorage.getItem("customTitle") || "Welcome Home",
      opened: false,
      loading: false,
    };
  }

  componentDidMount() {
    // Fetch the title from the server
    Api.getOption("title").then(option => {
      if (option.value) {
        localStorage.setItem("customTitle", option.value); // Save the title to local storage to avoid loading times
        this.setState({ title: option.value });
      }
    });
  }

  form = React.createRef<HTMLFormElement>();

  render() {
    document.title = this.state.title;
    return (
      <>
        <Modal
          opened={this.state.opened}
          onClose={() => {
            this.setState({
              opened: false,
              loading: false,
            });
          }}
          title="Set the title of your home page"
        >
          <form ref={this.form} onSubmit={async e => {
            e.preventDefault();
            this.setState({
              loading: true,
            });

            const formData = new FormData(this.form.current);

            const title = formData.get("title") as string;

            await Api.setOption("title", title);
            this.setState({
              title,
              loading: false,
              opened: false,
            });
          }}>
            <Group>
              <TextInput defaultValue={window.localStorage.getItem("customTitle") ?? ""} required name="title" label="Title" />
            </Group>
            <br />
            <Group position="right">
              <Button type="submit" loading={this.state.loading} color="green" onClick={() => this.form.current.requestSubmit()}>Create</Button>
              <Button type="reset" color="red" onClick={() => {
                this.setState({
                  opened: false,
                  loading: false,
                });
              }}>Cancel</Button>
            </Group>
          </form>
        </Modal>
        {/* <div className="customTitle"> */}
        <h2
          style={{
            color: "lightgray",
            padding: "0",
            margin: "0",
          }}

          onClick={() => this.setState({
            opened: true,
          })}
        >{this.state.title}</h2>
      </>
    )
  }
}
