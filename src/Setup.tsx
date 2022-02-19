import React from "react";
import "./App.scss";
import { Alert, Anchor, Button, Center, Container, Group, Loader, MantineProvider, NumberInput, PasswordInput, Select, Text, TextInput } from "@mantine/core";
import Api from "./api/Api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import fontAwesome from "@fortawesome/fontawesome";
import { faCheck, faPen } from "@fortawesome/free-solid-svg-icons";
import { Footer } from "./components/Footer/Footer";

// fontAwesome.library.add(faCheck as any, faPen as any);

function Setup() {
  const [dialect, setDialect] = React.useState<keyof Api.SqlDialects>("sqlite");
  const [loading, setLoading] = React.useState(false);
  const ref = {
    dbDialect: React.useRef<HTMLInputElement>(),

    // Database: mysql
    mysqlHost: React.useRef<HTMLInputElement>(),
    mysqlPort: React.useRef<HTMLInputElement>(),
    mysqlUser: React.useRef<HTMLInputElement>(),
    mysqlPassword: React.useRef<HTMLInputElement>(),
    mysqlDatabase: React.useRef<HTMLInputElement>(),

    // Database: sqlite
    sqliteStorage: React.useRef<HTMLInputElement>(),

    // General settings
    // TODO: User setup will be added here
  };

  function DialectMysql() {
    return (
      <>
        <TextInput label="Database" defaultValue="localhost" ref={ref.mysqlHost} required />
        <NumberInput label="Port" defaultValue={3306} ref={ref.mysqlPort} required />
        <TextInput label="User" ref={ref.mysqlUser} required />
        <PasswordInput label="Password" ref={ref.mysqlPassword} />
        <TextInput label="Database" ref={ref.mysqlDatabase} required />
        <sup>Please note that the database must exist in your MySQL instance</sup>
      </>
    );
  }

  function DialectSqlite() {
    return (
      <>
        <TextInput
          label="Database Storage Path"
          placeholder="/home/%USER%/welcome-home.db"
          ref={ref.sqliteStorage}
          required
        />
      </>
    );
  }

  function UseDialect() {
    switch (dialect) {
      case "mysql":
        return <DialectMysql />;
      case "sqlite":
        return <DialectSqlite />;
    }
  }

  return (
    <MantineProvider theme={{
      colorScheme: "dark",
    }}>
      <div className="main-app">
        <header className="main-app-header">
          {/* <CustomTitle /> */}
          <Group>
          </Group>
        </header>

        <Container style={{
          color: "white"
        }}>
          <h2>Setup of Welcome Home</h2>
          <p>Welcome Home! requires MySQL/MariaDB/Sqlite to be configured. Please enter the following information:</p>

          <h3>Step 1: Database  Setup</h3>
          <Group direction="column" grow>
            <Select
              label="Database Dialect"
              value={dialect}
              data={[
                { value: "sqlite", label: "SQLite" },
                { value: "mysql", label: "MySQL / MariaDB" },
              ]}
              ref={ref.dbDialect}
              onChange={(value) => {
                setDialect(value as any);
              }}
            />
            <UseDialect />

            <Button
              loading={loading}
              color="green"
              onClick={async () => {
                setLoading(true);
                switch (dialect) {
                  case "mysql":
                    await Api.createConfig(dialect, {
                      host: ref.mysqlHost.current.value,
                      port: +ref.mysqlPort.current.value,
                      username: ref.mysqlUser.current.value,
                      password: ref.mysqlPassword.current.value,
                      database: ref.mysqlDatabase.current.value,
                    });
                    break;

                  case "sqlite":
                    await Api.createConfig(dialect, {
                      storage: ref.sqliteStorage.current.value,
                    });
                }
                setTimeout(() => {
                  setLoading(false);
                  window.location.href = "/";
                }, 2000); // Wait for the server to properly restart
              }}
            >
              Finalize
            </Button>

          </Group>
        </Container>

        <Footer />
      </div>
    </MantineProvider>
  );
}

export default Setup;