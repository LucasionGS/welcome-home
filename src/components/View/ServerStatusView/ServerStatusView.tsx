import { Alert, Anchor, Badge, Container, Group, Loader, NumberInput, RingProgress, Select, Text } from "@mantine/core";
import React, { Component } from "react";
import Api, { type SystemStatsModule } from "../../../api/Api";
import { autoScaleByte, isEditMode, randomColor, showInEditMode } from "../../../helper";
import ProcessesList from "../../ProcessesList/ProcessesList";
import { LineChart, Line, Tooltip, CartesianGrid, XAxis, YAxis } from "recharts";
import "./ServerStatusView.scss";
import { useForceUpdate } from "@mantine/hooks";

interface ServerStatusViewProps { }
interface ServerStatusViewState {
  systemStats: SystemStatsModule.SystemStats;
}

// const statsHistory: (Omit<SystemStatsModule.SystemStats, "processes"> & {
//   timestamp: Date;
// })[] = [];

export default class ServerStatusView extends Component<ServerStatusViewProps, ServerStatusViewState> {
  constructor(props: ServerStatusViewProps) {
    super(props);
    this.state = {
      systemStats: null
    };
  }

  callback = () => {
    Api.getSystemStats().then(stats => {
      // const data = {
      //   ...stats,
      //   timestamp: new Date()
      // };

      // delete data.processes;
      // statsHistory.push(data);
      // if (statsHistory.length > 12) {
      //   statsHistory.shift();
      // }
      this.setState({ systemStats: stats });
    });
  };

  intervalId: number;
  timeBetweenUpdates = 5000;
  componentDidMount() {
    if (!isEditMode()) this.intervalId = window.setInterval(this.callback, this.timeBetweenUpdates);
    this.callback();
  }

  componentWillUnmount() {
    window.clearInterval(this.intervalId);
  }

  render() {
    const systemStats = this.state.systemStats;
    return (
      <div className="serverStatusView">
        <Container style={{
          backgroundColor: "#f5f5f50f",
          padding: "16px 32px",
          borderRadius: "8px",
          color: "text"
        }} size="lg">
          {
            systemStats ? (
              <DisplayStats systemStats={systemStats} />
            ) : (<h1>Loading data&nbsp;<Loader /></h1>)
          }

        </Container>
      </div >
    )
  }
}

function DisplayStats(props: { systemStats: SystemStatsModule.SystemStats }) {
  const update = useForceUpdate();
  const { systemStats } = props;

  // Locally stored options sections
  const options = {
    cpu: {
      direction: localStorage.getItem("ServerStatus.cpu.direction") || "center"
    },
    cpuThreads: {
      direction: localStorage.getItem("ServerStatus.cpuThreads.direction") || "center"
    },
    ram: {
      direction: localStorage.getItem("ServerStatus.ram.direction") || "center"
    },
    disks: {
      direction: localStorage.getItem("ServerStatus.disks.direction") || "center"
    },
    processes: {
      maxProcesses: (+localStorage.getItem("ServerStatus.processes.maxProcesses") || 10),
    }
  };

  // Prepared values
  const presetPositions = [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" }
  ];

  const memoryPercent = (systemStats.mem.active / systemStats.mem.total) * 100;
  const disks = systemStats.fs
    // Sort alphabetically
    .sort((a, b) => a.mount.localeCompare(b.mount))
    // Sort by length
    .sort((a, b) => a.mount.length - b.mount.length);

  return (
    <div className="stats">
      {
        showInEditMode(
          <Alert variant="filled" color="yellow">
            <Text>Edit mode enabled.</Text>
            <Text>Data will not update while in this mode.</Text>
          </Alert>
        )
      }
      <Group direction="column" grow>
        <div>
          <Text weight={500} style={{
            fontSize: "32px",
            textAlign: "center"
          }}>CPU</Text>
          {showInEditMode(
            <>
              <Select label="CPU: Edit Position" data={presetPositions} value={options.cpu.direction} onChange={(value) => {
                options.cpu.direction = value;
                localStorage.setItem("ServerStatus.cpu.direction", value);
                update();
              }} />
            </>
          )}
          <Group position={options.cpu.direction as any}>
            {systemStats.cpu.cores.length > 0 ? systemStats.cpu.cores.map((temp, i) => (
              <RingProgress
                size={150}
                thickness={18}
                roundCaps
                label={
                  <Text size="lg" align="center">
                    {temp.toFixed(1)}c°
                  </Text>
                }
                sections={[{
                  value: temp,
                  color:
                    temp > 70 ? "red"
                      : temp > 50 ? "orange"
                        : "green",
                }]}
              />
            )) : <Text>No data</Text>}
          </Group>
        </div>

        <div>
          <Text weight={500} style={{
            fontSize: "32px",
            textAlign: "center"
          }}>CPU (Threads)</Text>
          {showInEditMode(
            <>
              <Select label="CPU: Edit Position" data={presetPositions} value={options.cpuThreads.direction} onChange={(value) => {
                options.cpuThreads.direction = value;
                localStorage.setItem("ServerStatus.cpuThreads.direction", value);
                update();
              }} />
            </>
          )}
          <Group position={options.cpuThreads.direction as any}>
            {systemStats.load.cpus.length > 0 ? systemStats.load.cpus.map((thread, i) => (
              <RingProgress
                size={150}
                thickness={18}
                roundCaps
                label={
                  <Text size="lg" align="center">
                    {thread.load ? `${thread.load.toFixed(1)}` : "NaN"}%
                  </Text>
                }
                sections={[{
                  value: thread.load,
                  color:
                    thread.load > 70 ? "red"
                      : thread.load > 50 ? "orange"
                        : "green",
                }]}
              />
            )) : <Text>No data</Text>}
          </Group>
        </div>

        <div>
          <Text weight={500} style={{
            fontSize: "32px",
            textAlign: "center"
          }}>RAM</Text>
          {showInEditMode(
            <>
              <Select label="RAM: Edit Position" data={presetPositions} value={options.ram.direction} onChange={(value) => {
                options.ram.direction = value;
                localStorage.setItem("ServerStatus.ram.direction", value);
                update();
              }} />
            </>
          )}
          <Group position={options.ram.direction as any}>
            <RingProgress
              size={200}
              thickness={18}
              roundCaps
              label={
                <Text size="lg" align="center">
                  {autoScaleByte(systemStats.mem.active)} /
                  <br />
                  {autoScaleByte(systemStats.mem.total)}
                </Text>
              }
              sections={[{
                value: memoryPercent,
                color:
                  memoryPercent > 70 ? "red"
                    : memoryPercent > 50 ? "orange"
                      : "green",
              }]}
            />
          </Group>
        </div>

        <div>
          <Text weight={500} style={{
            fontSize: "32px",
            textAlign: "center"
          }}>DISK</Text>
          {showInEditMode(
            <>
              <Select label="DISK: Edit Position" data={presetPositions} value={options.disks.direction} onChange={(value) => {
                options.disks.direction = value;
                localStorage.setItem("ServerStatus.disks.direction", value);
                update();
              }} />
            </>
          )}
          <Group position={options.disks.direction as any}>
            {disks.map((disk, i) => {
              const diskPercent = (disk.used / disk.size) * 100;
              return (
                <Group direction="column" grow>
                  <Text size="lg" align="center">
                    <Anchor onClick={() => {
                      localStorage.setItem("FileExplorer.Directory", disk.mount);
                      window.location.pathname = "/file-explorer";
                    }}>
                      {disk.mount}
                    </Anchor>
                  </Text>
                  <RingProgress
                    size={210}
                    thickness={18}
                    roundCaps
                    label={
                      <Text size="lg" align="center">
                        {autoScaleByte(disk.used)} /
                        <br />
                        {autoScaleByte(disk.size)}
                        <br />
                        {disk.type}
                      </Text>
                    }
                    sections={[{
                      value: diskPercent,
                      color:
                        diskPercent > 90 ? "red"
                          : diskPercent > 70 ? "orange"
                            : "green",
                    }]}
                  />
                </Group>
              )
            })}
          </Group>
        </div>

        <div>
          <Text weight={500} style={{
            fontSize: "32px",
            textAlign: "center"
          }}>PROCESSES</Text>
          {showInEditMode(
            <Group>
              <NumberInput min={1} label="Max Processes" value={options.processes.maxProcesses} onChange={(value) => {
                options.processes.maxProcesses = value;
                localStorage.setItem("ServerStatus.processes.maxProcesses", value.toString());
                update();
              }} />
            </Group>
          )}
          <Group position="center">
            <ProcessesList maxDisplay={options.processes.maxProcesses} processes={systemStats.processes.list} />
          </Group>
        </div>
      </Group>
    </div>
  )
}