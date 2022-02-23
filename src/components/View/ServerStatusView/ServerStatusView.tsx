import { Anchor, Container, Group, RingProgress, Text } from "@mantine/core";
import React, { Component } from "react";
import Api, { type SystemStatsModule } from "../../../api/Api";
import { autoScaleByte } from "../../../helper";
import ProcessesList from "../../ProcessesList/ProcessesList";
import "./ServerStatusView.scss";

interface ServerStatusViewProps { }
interface ServerStatusViewState {
  systemStats: SystemStatsModule.SystemStats;
}

export default class ServerStatusView extends Component<ServerStatusViewProps, ServerStatusViewState> {
  constructor(props: ServerStatusViewProps) {
    super(props);
    this.state = {
      systemStats: null
    };
  }

  callback = () => {
    Api.getSystemStats().then(stats => {
      this.setState({ systemStats: stats });
    });
  };

  intervalId: number;
  componentDidMount() {
    this.intervalId = window.setInterval(this.callback, 2000);
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
            ) : (<h1>Loading data...</h1>)
          }

        </Container>
      </div >
    )
  }
}

function DisplayStats(props: { systemStats: SystemStatsModule.SystemStats }) {
  const { systemStats } = props;

  // Prepared values
  const memoryPercent = (systemStats.mem.active / systemStats.mem.total) * 100;
  const disks = systemStats.fs
    // Sort alphabetically
    .sort((a, b) => a.mount.localeCompare(b.mount))
    // Sort by length
    .sort((a, b) => a.mount.length - b.mount.length);

  return (
    <div className="stats">
      <Group direction="column" grow>
        <div>
          <Text weight={500} style={{
            fontSize: "32px",
            textAlign: "center"
          }}>CPU</Text>
          <Group position="center">
            {systemStats.cpu.cores.length > 0 ? systemStats.cpu.cores.map((temp, i) => (
              <RingProgress
                size={150}
                thickness={18}
                roundCaps
                label={
                  <Text size="lg" align="center">
                    {temp.toFixed(1)}%
                    <br />
                    {systemStats.cpu.cores[i].toFixed(0)}c°
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
          <Group position="center">
            {systemStats.load.cpus.length > 0 ? systemStats.load.cpus.map((thread, i) => (
              <RingProgress
                size={150}
                thickness={18}
                roundCaps
                label={
                  <Text size="lg" align="center">
                    {thread.load ? `${thread.load.toFixed(1)}%` : "NaN%"}
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
          <Group position="center">
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
          <Group position="center">
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
          <Group position="center">
            <ProcessesList maxDisplay={30} processes={systemStats.processes.list} />
          </Group>
        </div>
      </Group>
    </div>
  )
}