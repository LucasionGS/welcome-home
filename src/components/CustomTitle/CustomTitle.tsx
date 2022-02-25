import { Button, Group, Image, Modal, Text, TextInput } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import React, { Component } from "react";
import Api from "../../api/Api";
import "./CustomTitle.scss";

interface CustomTitleProps { }
interface CustomTitleState {
  title: string;
  imageUrl: string;
  opened: boolean;
  loading: boolean;
}

export default class CustomTitle extends Component<CustomTitleProps, CustomTitleState> {
  constructor(props: CustomTitleProps) {
    super(props);
    this.state = {
      title: localStorage.getItem("customTitle") || "Welcome Home",
      imageUrl: Api.baseUrl + "/favicon.ico",
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
          title="Change metadata"
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
            <Text>Favicon</Text>
            <Group>
              <Image src={this.state.imageUrl} height={64} width={64} />
              <Dropzone
                onDrop={(async files => {
                  files.forEach(file => {
                    // Create data url for `file`
                    const reader = new FileReader();
                    reader.onload = (f) => {
                      // Update the image url
                      this.setState({
                        imageUrl: f.target.result as string,
                      });
                    };
                    reader.readAsDataURL(file);

                    Api.setFavicon(file).then(image => {
                    });
                  });
                })}
                multiple={false}
                maxSize={Infinity}
              >
                {(status) => (
                  <Group position="center" spacing="xl" style={{ pointerEvents: 'none' }}>
                      <Text size="xl" inline>
                        Select favicon
                      </Text>
                    {/* <div>
                    </div> */}
                  </Group>
                )}
              </Dropzone>
              <TextInput defaultValue={window.localStorage.getItem("customTitle") ?? ""} required name="title" label="Title" />
            </Group>
            <br />
            <Group position="right">
              <Button type="submit" loading={this.state.loading} color="green" onClick={() => this.form.current.requestSubmit()}>Update metadata</Button>
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
        <Group
          onClick={() => this.setState({
            opened: true,
          })}

          style={{
            cursor: "pointer",
          }}
        >
          <Image src={this.state.imageUrl} height={32} width={32} radius="md" />
          <h2
            style={{
              color: "lightgray",
              padding: "0",
              margin: "0",
            }}
          >{this.state.title}</h2>
        </Group>
      </>
    )
  }
}
