import { Button, Checkbox, Chip, Chips, Group, Image, Modal, Text, Textarea, TextInput } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import RichTextEditor from "@mantine/rte";
import React, { useRef } from "react";
import Api from "../../api/Api";
import { Action, ActionModel } from "../../models/Action";
import "./CreateAction.scss";

interface CreateActionProps {
  /**
   * If defined, updates existing Action.
   */
  updateAction?: Action;
  /**
   * Override the button text.
   */
  buttonText?: string;
  /**
   * Override the title text.
   */
  titleText?: string;

  fullWidth?: boolean;

  component?: (openModal: () => void) => JSX.Element;

  /**
   * Executes when a new Action is created or an existing Action is updated.
   */
  onCreate?: (Action: Action) => void;
}

export default function CreateAction(props: CreateActionProps) {
  function getValue<T extends keyof ActionModel>(key: T, defaultValue?: ActionModel[T]): ActionModel[T] {
    if (props.updateAction) {
      return (props.updateAction[key] ?? (defaultValue ?? null)) as ActionModel[T];
    }
    return defaultValue;
  }
  const [opened, setOpened] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [descriptionText, setDescriptionText] = React.useState(getValue("description"));
  const [imageUrl, setImageUrl] = React.useState(getValue("image"));

  const form = useRef<HTMLFormElement>();

  const openModal = () => setOpened(true);

  return (
    <div>
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          setLoading(false);
        }}
        title={props.titleText ? props.titleText : "Create a new Action"}
        size={720}
      >
        <form ref={form} onSubmit={async e => {
          e.preventDefault();
          setLoading(true);

          const formData = new FormData(form.current);


          if (props.updateAction) {
            props.updateAction.title = formData.get("title") as string;
            props.updateAction.description = formData.get("description") as string;
            props.updateAction.command = formData.get("command") as string;
            props.updateAction.image = formData.get("image") as string;
            await Api.updateAction(props.updateAction);
            if (typeof props.onCreate === "function") props.onCreate(props.updateAction);
          }
          else {
            const Action = await Api.createAction({
              title: formData.get("title") as string,
              description: formData.get("description") as string,
              command: formData.get("command") as string,
              image: formData.get("image") as string,
            });
            if (typeof props.onCreate === "function") props.onCreate(Action);
          }

          setLoading(false);
          setOpened(false);
        }}>
          <Group position="left" direction="column" grow>
            {/* <NumberInput hidden name="id" value={props.updateAction ? props.updateAction.id : null} /> */}
            <TextInput required name="title" label="Title" defaultValue={getValue("title")} />
            <Textarea readOnly style={{ display: "none" }} name="description" label="Description" value={descriptionText} />

            <TextInput required name="command" label="Command" defaultValue={getValue("command")} />

            <Group grow>
              <TextInput name="image" label="Icon URL" value={imageUrl} onChange={(v) => setImageUrl(v.currentTarget.value)} />

              <Group position="right">
                <Dropzone
                  onDrop={(async files => {
                    files.forEach(file => {
                      Api.uploadImage(file).then(data => {
                        // Get only the path from the URL
                        const url = new URL(data.url);
                        setImageUrl(url.pathname);
                      });
                    });
                  })}
                  multiple={false}
                  maxSize={Infinity}
                >
                  {(status) => (
                    <Image src={imageUrl?.startsWith("/") ? (Api.baseUrl + imageUrl) : imageUrl} height={64} width={64} />
                  )}
                </Dropzone>
              </Group>
            </Group>

            <Text weight={"bold"} size="sm">Description</Text>
            <RichTextEditor
              onChange={setDescriptionText}
              value={descriptionText}
              onImageUpload={async (file: File) => {
                const data = await Api.uploadImage(file);
                if (data) {
                  return data.url;
                }
                else {
                  return null;
                }
              }}
              controls={[
                [
                  "bold",
                  "italic",
                  "underline",
                  "strike",
                  "link",
                  "blockquote",
                  "code",
                ],
                [
                  "image",
                  "video",
                ],
                [
                  "unorderedList",
                  "orderedList",
                ],
                [
                  "h1",
                  "h2",
                  "h3",
                ],
                [
                  "sup",
                  "sub",
                ],
                [
                  "alignLeft",
                  "alignCenter",
                  "alignRight",
                ]
              ]}
            />
          </Group>
          <br />
          <Group grow>
            <Group position="left">
              {
                true && props.updateAction ? // TODO: Make condition to check if the user is logged in
                  <ConfirmableDelete Action={props.updateAction} onDelete={() => {
                    if (typeof props.onCreate === "function") props.onCreate(null);
                  }} /> : null
              }
            </Group>
            <Group position="right">
              <Button type="submit" loading={loading} color="green" onClick={() => form.current.requestSubmit()}>
                {props.buttonText ? props.buttonText : "Create"}
              </Button>
              <Button type="reset" color="red" onClick={() => {
                setOpened(false);
                setLoading(false);
              }}>Cancel</Button>
            </Group>
          </Group>
        </form>
      </Modal>

      {
        props.component ?
          props.component(openModal) :
          (
            <Button
              fullWidth={props.fullWidth}
              className="create-action-button"
              onClick={openModal}>{props.buttonText ? props.buttonText : "Create Action"}
            </Button>
          )
      }
    </div>
  )
}

function ConfirmableDelete(props: {
  Action: Action;
  onDelete: () => void;
}) {
  const [opened, setOpened] = React.useState(false);
  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Delete Action">
        <Text>Are you sure you want to delete this Action?</Text>
        <Group position="right">
          <Button color="red" onClick={() => {
            if (props.Action) {
              Api.deleteAction(props.Action.id).then(() => {
                if (typeof props.onDelete === "function") props.onDelete();
              });
            }
          }}>Yes</Button>
          <Button onClick={() => setOpened(false)}>No</Button>
        </Group>
      </Modal>

      <Button type="reset" color="red" onClick={() => setOpened(true)}>
        Delete
      </Button>
    </>
  );
}