import { Button, Center, Group, Image, Loader, Modal, Paper } from '@mantine/core'
import React, { useState } from 'react'
import Api from '../../../api/Api';
import { showInEditMode } from '../../../helper'
import { Action } from '../../../models/Action';
import CreateAction from '../../CreateAction/CreateAction';
import { editMode } from '../../Header/Header';

export default function ActionsView() {
  const [actions, setActions] = useState<Action[]>(null);

  if (!actions) {
    Api.getActions().then(actions => {
      setActions(actions);
    });
  }

  return (
    <div>
      <Group>
        {showInEditMode(
          <CreateAction onCreate={action => setActions([...actions.filter(a => a && a.id !== action?.id), action])} />
        )}
      </Group>

      <Center>
        <Paper withBorder style={{
          width: "80%",
          padding: "1rem",
        }}>
          <Group>
            {actions?.map(action => (action &&
              <ActionCard key={action.id} action={action} actions={actions} setActions={setActions} />
            )) || <Loader />}
          </Group>
        </Paper>
      </Center>
    </div>
  );
}

function ActionCard(props: { action: Action, actions: Action[], setActions: (actions: Action[]) => void }) {
  const { action, actions, setActions } = props;
  const [output, setOutput] = useState<string>(undefined);
  const [loading, setLoading] = useState(false);
  return (
    <div>
      <Paper withBorder style={{
        backgroundColor: output === null ? "#ffaaaa" : output === undefined ? "gray" : "#aaffaa",
        transition: "background-color 0.5s",
        overflow: "hidden",
        borderRadius: "0.5rem",
      }}>

        {
          loading ? <Loader variant="dots" size={128} /> : (
            action.image ?
              (
                <TriggerCommand onExecute={(e) => {
                  setOutput(undefined);
                  if (e.defaultPrevented) return;
                  setLoading(true);
                }} onResult={res => {
                  setLoading(false);
                  setOutput(res);
                }} action={action} component={(onClick, onSecondaryClick) => (
                  <Image title={action.title} onContextMenu={!editMode ? onSecondaryClick : null} onClick={!editMode ? onClick : null} height={128} width={128} src={action.getImageUrl()} style={{ cursor: "pointer" }} />
                )} />
              ) :
              (
                <>
                  <div>{action.title}</div>
                  <TriggerCommand onExecute={(e) => {
                    setOutput(undefined);
                    if (e.defaultPrevented) return;
                    setLoading(true);
                  }} onResult={res => {
                    setOutput(res);
                    setLoading(false);
                  }} action={action} />
                </>
              )
          )
        }
        {showInEditMode(
          <Center>
            <CreateAction buttonText="Edit Action" updateAction={action} onCreate={action => setActions(action && [...actions.filter(a => a && a.id !== action?.id), action])} />
          </Center>
        )}
      </Paper>
    </div>
  );
}

function TriggerCommand(props: {
  action: Action,
  component?: (onClick: React.MouseEventHandler<HTMLElement>, onSecondaryClick: React.MouseEventHandler<HTMLElement>) => JSX.Element,
  onResult?: (result: string) => void,
  onExecute?: React.MouseEventHandler<HTMLElement>,
}) {
  const { action } = props;
  const [openedModal, setOpenedModal] = useState(false);
  const [output, setOutput] = useState(null);

  const onClick: React.MouseEventHandler<HTMLElement> = async (e) => {
    if (props.onExecute) {
      props.onExecute(e);
    }
    setOutput(null);
    const result = await Api.triggerAction(action.id).then(output => {
      setOutput(output);
      return output;
    }).catch(err => {
      console.error(err);
      return null;
    });

    if (props.onResult) {
      props.onResult(result);
    }
  };

  const onSecondaryClick: React.MouseEventHandler<HTMLElement> = async (e) => {
    e.preventDefault();
    setOpenedModal(true);
    onClick(e);
  };

  return (
    <>
      {
        props.component ? props.component(onClick, onSecondaryClick) : (
          <>
            <Button onClick={onClick}>
              Execute
            </Button>
            <Button onClick={onSecondaryClick}>
              Execute (Show output)
            </Button>
          </>
        )
      }
      <Modal opened={openedModal} onClose={() => setOpenedModal(false)}>
        <Paper>
          <div>
            <pre>
              {output === null ? <><Loader /> Executing...</> : output}
            </pre>
          </div>
        </Paper>
      </Modal>
    </>
  );
}