import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { shell } from "@tauri-apps/api";

import { Alert, AppShell, Menu } from "@mantine/core";
import {
  IconDots,
  IconSettings,
  IconPlug,
  IconFolder,
  IconAlertCircle,
} from "@tabler/icons-react";

import { Demo, DemoFilter, SortKey, SortOrder } from "@/demo";
import { HeaderButton, HeaderBar } from "@/AppShell";
import { getDemosInDirectory } from "@/api";
import DemoList from "./DemoList";
import SearchInput from "./SearchInput";
import { SortControl } from "./SortControl";
import { Path } from "@/store";
import { Fill, LoaderFallback } from "@/components";
import useLocationState from "@/hooks/useLocationState";

type DemoListLoaderArgs = {
  path: string;
  sortKey: SortKey;
  reverse: boolean;
  filters: DemoFilter[];
};

function ErrorBox({ error }: { error: string }) {
  return (
    <Fill>
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="An error occurred while scanning for demo files"
        color="red"
      >
        {String(error)}
      </Alert>
    </Fill>
  );
}

function DemoListLoader({
  path,
  sortKey,
  reverse,
  filters,
}: DemoListLoaderArgs) {
  const [demos, setDemos] = useState<Demo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDemosInDirectory(path, sortKey, reverse, filters)
      .then(setDemos)
      .catch(setError);
  }, [path, sortKey, reverse, filters]);

  if (demos !== null) {
    return <DemoList demos={demos} />;
  } else if (error !== null) {
    return <ErrorBox error={error} />;
  } else {
    return <LoaderFallback />;
  }
}

export default () => {
  const { path } = useParams() as { path: Path };

  const [locationState, setLocationState] = useLocationState({
    query: "",
    sortKey: "birthtime" as SortKey,
    sortOrder: "descending" as SortOrder,
  });

  console.log(locationState);

  const filters: DemoFilter[] = [];

  return (
    <AppShell header={{ height: 50 }}>
      <AppShell.Header>
        <HeaderBar
          center={
            <>
              <SearchInput
                query={locationState.query}
                setQuery={setLocationState("query")}
              />
            </>
          }
          right={
            <>
              <SortControl
                sortKey={locationState.sortKey}
                setSortKey={setLocationState("sortKey")}
                sortOrder={locationState.sortOrder}
                setSortOrder={setLocationState("sortOrder")}
              />
              <div style={{ margin: "auto" }} />
              <Menu
                shadow="md"
                position="bottom-end"
                transitionProps={{
                  transition: "pop-top-right",
                }}
              >
                <Menu.Target>
                  <HeaderButton>
                    <IconDots />
                  </HeaderButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconSettings size={14} />}
                    component={Link}
                    to="/settings"
                  >
                    Settings
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconPlug size={14} />}
                    component={Link}
                    to="/rcon-setup"
                  >
                    Set up RCON
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconFolder size={14} />}
                    onClick={() => shell.open(path)}
                  >
                    Show in explorer
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </>
          }
        />
      </AppShell.Header>
      <AppShell.Main>
        <DemoListLoader
          path={path}
          sortKey={locationState.sortKey}
          reverse={locationState.sortOrder === "descending"}
          filters={filters}
        />
      </AppShell.Main>
    </AppShell>
  );
};
