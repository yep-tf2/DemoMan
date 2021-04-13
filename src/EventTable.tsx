import React, { PureComponent } from "react";
import DataTable from "react-data-table-component";

import ArrowDownward from "@material-ui/icons/ArrowDownward";
import IconButton from "@material-ui/core/IconButton";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/Save";
import AddIcon from "@material-ui/icons/Add";
import Tooltip from "@material-ui/core/Tooltip";

import { Demo } from "./Demos";
import DemoEvent from "./DemoEvent";
import { getPreferredTheme } from "./theme";

const columns = [
  {
    name: "Tick",
    selector: "tick",
    sortable: true,
    grow: 1,
  },
  {
    name: "Name",
    selector: "name",
    sortable: true,
    grow: 2,
  },
  {
    name: "Value",
    selector: "value",
    sortable: true,
    grow: 4,
  },
];

type EventTableProps = {
  demo: Demo;
};

type EventTableState = {
  demo: Demo;
  data: DemoEvent[];
  unsavedChanges: boolean;
};

export default class EventTable extends PureComponent<
  EventTableProps,
  EventTableState
> {
  constructor(props: EventTableProps) {
    super(props);
    this.state = {
      data: [],
      demo: props.demo,
      unsavedChanges: false,
    };
  }

  componentDidMount() {
    this.DiscardChanges();
  }

  DiscardChanges = async () => {
    const { demo } = this.state;
    this.setState({
      data: await demo.events(),
    });
  };

  AddEvent = () => {
    this.setState({
      unsavedChanges: true,
    });
  };

  SaveChanges = () => {
    this.setState({
      unsavedChanges: false,
    });
  };

  render() {
    const { data, unsavedChanges } = this.state;

    return (
      <DataTable
        title="Events"
        columns={columns}
        defaultSortField="tick"
        defaultSortAsc
        highlightOnHover
        noDataComponent={
          <div style={{ height: "2rem" }}>
            This demo doesn&apos;t have any events recorded.
          </div>
        }
        actions={
          <>
            <Tooltip title="Add event">
              <IconButton color="default" onClick={this.AddEvent}>
                <AddIcon />
              </IconButton>
            </Tooltip>
            {unsavedChanges && (
              <>
                <Tooltip title="Discard changes">
                  <IconButton color="primary" onClick={this.DiscardChanges}>
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Save changes">
                  <IconButton color="primary" onClick={this.SaveChanges}>
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </>
        }
        data={data}
        sortIcon={<ArrowDownward />}
        fixedHeader
        // 64px: Page title,
        // 1px: Divider,
        // 24px and 5px: padding,
        // 56px: table title,
        // 57px: table header.
        fixedHeaderScrollHeight="calc(100vh - 64px - 1px - 2 * 24px - 2 * 5px - 56px - 57px)"
        theme={getPreferredTheme()}
      />
    );
  }
}