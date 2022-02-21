import { Container, Group, RingProgress, SimpleGrid, Text } from "@mantine/core";
import React, { Component } from "react";
import Api, { type SystemStatsModule } from "../../../api/Api";
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
      console.log(stats);

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
  console.log(systemStats.load.cpus);

  function autoScaleByte(bytes: number) {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    }
    if (bytes < 1024 * 1024 * 1024 * 1024) {
      return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
    }
    if (bytes < 1024 * 1024 * 1024 * 1024 * 1024) {
      return `${(bytes / 1024 / 1024 / 1024 / 1024).toFixed(2)} TB`;
    }
    return `${(bytes / 1024 / 1024 / 1024 / 1024 / 1024).toFixed(2)} PB`;
  }

  // Prepared values
  const memoryPercent = (systemStats.mem.active / systemStats.mem.total) * 100;

  return (
    <div className="stats">
      <Group direction="column">
        <div>
          <Text weight={500} style={{
            fontSize: "32px",
          }}>CPU</Text>
          <Group position="center">
            {systemStats.load.cpus.map((cpu, i) => (
              <RingProgress
                size={150}
                thickness={18}
                roundCaps
                label={
                  <Text size="lg" align="center">
                    {cpu.load.toFixed(1)}%
                    <br />
                    {systemStats.cpu.cores[i].toFixed(0)}c°
                  </Text>
                }
                sections={[{
                  value: cpu.load,
                  color:
                    cpu.load > 70 ? "red"
                      : cpu.load > 50 ? "orange"
                        : "green",
                }]}
              />
            ))
            }
          </Group>
        </div>

        <div>
          <Text weight={500} style={{
            fontSize: "32px",
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
          }}>DISK</Text>
          <Group position="center">
            {systemStats.fs.map((disk, i) => {
              const diskPercent = (disk.used / disk.size) * 100;
              return (
                <Group direction="column" grow>
                  <Text size="lg" align="center">
                    {disk.mount}
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
                        diskPercent > 70 ? "red"
                          : diskPercent > 50 ? "orange"
                            : "green",
                    }]}
                  />
                </Group>
              )
            })}
          </Group>
        </div>
      </Group>
    </div>
  )
}