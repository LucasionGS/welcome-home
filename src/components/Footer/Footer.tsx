import React from "react";
import { Anchor, Container, Group, Text } from "@mantine/core";

export function Footer() {
  // const [scroll, setScroll] = useWindowScroll();
  return (
    <Container fluid mt={64}>
      <Group grow>
        <Text
          align="left"
          style={{
            color: "white",
          }}
        >
          <Text>Welcome Home™️</Text>
          <Text>
            Developed by <Anchor href="https://github.com/LucasionGS">Lucasion</Anchor>
          </Text>
        </Text>

        <Text
          align="right"
          style={{
            color: "white",
          }}
        >
          <Text>Open Source Project</Text>
          <Anchor href="https://github.com/LucasionGS/welcome-home">
            <Text>Share the GitHub Repository</Text>
          </Anchor>
        </Text>

      </Group>
    </Container>
  );
}
