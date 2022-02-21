import { Button, Checkbox, Chip, Chips, Group, Modal, Text, Textarea, TextInput } from "@mantine/core";
import RichTextEditor from "@mantine/rte";
import React, { useRef } from "react";
import Api from "../../api/Api";
import { WebCard, WebCardModel } from "../../models/WebCard";
import "./CreateWebCard.scss";

interface CreateWebCardProps {
  /**
   * If defined, updates existing web card.
   */
  updateWebCard?: WebCard;
  /**
   * Override the button text.
   */
  buttonText?: string;
  /**
   * Override the title text.
   */
  titleText?: string;

  fullWidth?: boolean;

  /**
   * Executes when a new WebCard is created or an existing WebCard is updated.
   */
  onCreate?: (webCard: WebCard) => void;
}

export default function CreateWebCard(props: CreateWebCardProps) {
  function getValue<T extends keyof WebCardModel>(key: T, defaultValue?: WebCardModel[T]): WebCardModel[T] {
    if (props.updateWebCard) {
      return (props.updateWebCard[key] ?? (defaultValue ?? null)) as WebCardModel[T];
    }
    return defaultValue;
  }
  const [opened, setOpened] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [descriptionText, setDescriptionText] = React.useState(getValue("description"));

  const form = useRef<HTMLFormElement>();

  return (
    <div>
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          setLoading(false);
        }}
        title={props.titleText ? props.titleText : "Create a new Web Card"}
        size={720}
      >
        <form ref={form} onSubmit={async e => {
          e.preventDefault();
          setLoading(true);

          const formData = new FormData(form.current);


          if (props.updateWebCard) {
            props.updateWebCard.title = formData.get("title") as string;
            props.updateWebCard.description = formData.get("description") as string;
            props.updateWebCard.url = formData.get("url") as string;
            props.updateWebCard.image = formData.get("image") as string;
            props.updateWebCard.target = formData.get("target") as string;
            props.updateWebCard.checkAvailable = formData.has("checkAvailable");
            props.updateWebCard.category = formData.get("category") as string;
            await Api.updateWebCard(props.updateWebCard);
            if (typeof props.onCreate === "function") props.onCreate(props.updateWebCard);
          }
          else {
            await Api.createWebCard({
              title: formData.get("title") as string,
              description: formData.get("description") as string,
              url: formData.get("url") as string,
              image: formData.get("image") as string,
              target: formData.get("target") as string,
              checkAvailable: formData.has("checkAvailable"),
              category: formData.get("category") as string,
            });
            if (typeof props.onCreate === "function") props.onCreate(props.updateWebCard);
          }

          setLoading(false);
          setOpened(false);
        }}>
          <Group position="left" direction="column" grow>
            {/* <NumberInput hidden name="id" value={props.updateWebCard ? props.updateWebCard.id : null} /> */}
            <TextInput required name="title" label="Title" defaultValue={getValue("title")} />
            <Textarea readOnly style={{ display: "none" }} name="description" label="Description" value={descriptionText} />
            <TextInput required type="url" name="url" label="Url" defaultValue={getValue("url")} />
            <TextInput name="image" label="Icon URL" defaultValue={getValue("image")} />
            <TextInput name="category" label="Category" defaultValue={getValue("category")} />
            <Chips name="target" defaultValue={getValue("target", "_self")}>
              <Chip value="_self">Same Tab</Chip>
              <Chip value="_blank">New Tab</Chip>
            </Chips>
            <Checkbox
              name="checkAvailable"
              label="Check availability"
              title="If checked, will give status message for the site on load"
              defaultChecked={getValue("checkAvailable", true)}
            />

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
                true && props.updateWebCard ? // TODO: Make condition to check if the user is logged in
                  <ConfirmableDelete webCard={props.updateWebCard} onDelete={() => {
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

      <Button fullWidth={props.fullWidth} className="create-web-card-button" onClick={() => setOpened(true)}>{props.buttonText ? props.buttonText : "Create Web Card"}</Button>
      {/* <Group position="center">
      </Group> */}
    </div>
  )
}

function ConfirmableDelete(props: {
  webCard: WebCard;
  onDelete: () => void;
}) {
  const [opened, setOpened] = React.useState(false);
  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Delete Web Card">
        <Text>Are you sure you want to delete this Web Card?</Text>
        <Group position="right">
          <Button color="red" onClick={() => {
            if (props.webCard) {
              Api.deleteWebCard(props.webCard.id).then(() => {
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