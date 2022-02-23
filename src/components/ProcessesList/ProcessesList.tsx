import React, { Component } from "react";
import "./ProcessesList.scss";
import { type SystemStatsModule } from "../../api/Api";
import { Button, Select, Table } from "@mantine/core";
import fontAwesome from "@fortawesome/fontawesome";
import {
  faSortAsc,
  faSortDesc,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

(fontAwesome.library.add as any)(
  faSortAsc,
  faSortDesc,
);

interface ProcessesListProps {
  processes?: SystemStatsModule.Process[];
  setProcesses?: () => (processes: SystemStatsModule.Process[]) => void;
  maxDisplay?: number;
}
interface ProcessesListState {
  processes: SystemStatsModule.Process[];
  sortBy: keyof SystemStatsModule.Process;
  sortOrder: "asc" | "desc";
  showAll: boolean;
  /**
   * If true, hide the values that are 0 in usage.
   */
  hideStaleProcesses: boolean;
  /**
   * When an id is set to a value, forces a field to be matched to be displayed.
   */
  advancedFilter: {
    [id: string]: string;
  };
}


export default class ProcessesList extends Component<ProcessesListProps, ProcessesListState> {
  constructor(props: ProcessesListProps) {
    super(props);
    this.state = {
      processes: props.processes ?? [],
      sortBy: localStorage.getItem("ProcessList.sortBy") as any || "cpu",
      sortOrder: localStorage.getItem("ProcessList.sortOrder") as any || "desc",
      showAll: false,
      hideStaleProcesses: true,
      advancedFilter: {},
    };
  }

  private _defaultmaxDisplay = 10;

  setSortBy = (newSortBy: keyof SystemStatsModule.Process) => {
    const { sortBy, sortOrder } = this.state;
    if (newSortBy === sortBy) {
      const newSortOrder = newSortBy === sortBy && sortOrder === "asc" ? "desc" : "asc";
      this.setState({ sortOrder: newSortOrder });

      localStorage.setItem("ProcessList.sortBy", newSortBy);
      localStorage.setItem("ProcessList.sortOrder", newSortOrder);
    } else {
      this.setState({ sortBy: newSortBy, sortOrder: "desc" });

      localStorage.setItem("ProcessList.sortBy", newSortBy);
      localStorage.setItem("ProcessList.sortOrder", "desc");
    }

  }

  Sort(props: {
    sortBy: keyof SystemStatsModule.Process;
  }) {
    return (
      <FontAwesomeIcon icon={faSortAsc} onClick={e => {
        this.setSortBy(props.sortBy);
      }} />
    );
  }

  toggleShowAll() {
    this.setState({ showAll: !this.state.showAll });
  }

  render() {
    const processes = this.props.processes;

    const columns: {
      name: string,
      id: keyof typeof rows[number];

      /**
       * Default assumed to be `string`.
       */
      type?: "number" | "string"
    }[] = [
        {
          name: "PID",
          id: "pid",
          type: "number",
        },
        {
          name: "Name",
          id: "name"
        },
        {
          name: "CPU",
          id: "cpu",
          type: "number"
        },
        {
          name: "Memory",
          id: "mem",
          type: "number"
        },
        {
          name: "User",
          id: "user"
        },
        {
          name: "Command",
          id: "command"
        },
        {
          name: "Started",
          id: "started"
        },
      ];

    const rows = processes ? (processes.sort((a, b) => {
      const aVal = a[this.state.sortBy];
      const bVal = b[this.state.sortBy];
      if (this.state.sortOrder === "asc") {
        return aVal > bVal ? 1 : aVal === bVal ? 0 : -1;
      } else {
        return aVal < bVal ? 1 : aVal === bVal ? 0 : -1;
      }
    }).filter(
      // Search filter
      (process) => {
        const { advancedFilter } = this.state;
        for (const [id, value] of Object.entries(advancedFilter) as [keyof SystemStatsModule.Process, string][]) {
          if (value && process[id] !== value) {
            return false;
          }
        }
        return true;
      }
    ).slice(
      0,
      this.state.showAll ? processes.length : this.props.maxDisplay ?? this._defaultmaxDisplay
    ).map(process => ({
      pid: process.pid,
      name: process.name,
      cpu: process.cpu.toFixed(2) + "%",
      mem: process.mem.toFixed(2) + "%",
      user: process.user,
      command: process.command,
      started: process.started,
    }))) : [];


    const ShowAllBtn = () => (
      <tr hidden={
        processes.length <= (this.props.maxDisplay ?? this._defaultmaxDisplay)
      }>
        <td colSpan={columns.length}>
          <Button
            onClick={() => {
              this.toggleShowAll();
            }}
          >
            {
              this.state.showAll ? `Show top ${this.props.maxDisplay ?? this._defaultmaxDisplay} processes` : `Show all ${processes.length} processes`
            }
          </Button>
        </td>
      </tr>
    )

    return (
      <Table
        highlightOnHover

        sx={{
          "&": {
            tableLayout: "fixed"
          }
        }}
      >
        <thead>
          <ShowAllBtn />
          <tr>
            {columns.map(column => (
              <th
                key={column.id + "-af"}
              >
                {column.type !== "number" ? (
                  <Select
                    searchable
                    clearable
                    clearButtonLabel="Clear"
                    value={this.state.advancedFilter[column.id]}
                    onChange={(v) => {
                      const newAdvancedFilter = {
                        ...this.state.advancedFilter,
                        [column.id]: v
                      };
                      this.setState({ advancedFilter: newAdvancedFilter });
                    }}
                    data={
                      [
                        ...new Set(processes.map(row => row[column.id].toString()))
                      ]
                    }
                  />
                ) : null}
              </th>
            ))}
          </tr>
          <tr>
            {columns.map(column => (
              <th
                onClick={e => {
                  this.setSortBy(column.id);
                }}
                className="sortable"
                key={column.id}
              >
                {column.name}
                &nbsp;
                {
                  this.state.sortBy === column.id ? (<FontAwesomeIcon icon={
                    this.state.sortOrder === "asc" ?
                      faSortAsc :
                      faSortDesc
                  } />) : null
                }
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.pid}>
              {columns.map(column => (
                <td
                  key={column.id}
                  style={{
                    // Ellipsis
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                  }}
                  title={row[column.id].toString()}
                >{
                    this.state.hideStaleProcesses && row[column.id] === "0.00%" ? null : row[column.id]
                  }</td>
              ))}
            </tr>
          ))}
          <ShowAllBtn />
        </tbody>
      </Table>
    )
  }
}
