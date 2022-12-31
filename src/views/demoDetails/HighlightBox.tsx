import { createStyles, useMantineTheme } from "@mantine/core";

import {
  ChatMessageHighlight,
  AirshotHighlight,
  CrossbowAirshotHighlight,
  Highlight,
  KillHighlight,
  PointCapturedHighlight,
  RoundWinHighlight,
  PlayerConnectedHighlight,
  PlayerDisconnectedHighlight,
  UserId,
  PlayerSummary,
  TEAM_NAMES,
  HighlightPlayerSnapshot, Team,
} from "../../demo";
import { KillIcon } from "../../components";

type HighlightProps = {
  event: Highlight;
  playerMap: Map<UserId, PlayerSummary>;
};

const useStyles = createStyles(
  (
    theme,
    {
      justifyContent,
    }: { justifyContent: React.CSSProperties["justifyContent"] }
  ) => ({
    root: {
      flexGrow: 1,
      display: "flex",
      alignItems: "center",
      justifyContent,
      height: 40,
      paddingRight: 16,
    },
  })
);

type PlayerNameProps = {
  player: PlayerSummary | HighlightPlayerSnapshot | undefined;
  /**
   * The team the player is on.  Used to override the team color on the player object.
   * This can be helpful in the uncommon cases where the player's team is set to "other".
   */
  team?: Team | number;
}

function PlayerName({ player, team = undefined }: PlayerNameProps) {
  const theme = useMantineTheme();
  let color = "unset";
  const name = player?.name ?? "<unknown>";

  if (team !== undefined) {
    switch (team) {
      case "red":
      case 2: // red team number
        color = theme.colors.red[6];
        break;
      case "blue":
      case 3: // blue team number
        color = theme.colors.blue[6];
        break;
      default: // no team specified
        break;
    }
  }

  if (color === "unset") {
    if (player !== undefined) {
      if (player.team === "red") {
        color = theme.colors.red[6];
      } else if (player.team === "blue") {
        color = theme.colors.blue[6];
      } else {
        // No team was specified and the player isn't associated with a team (did we miss an m_iTeam update?)
      }
    }
  }
  return <span style={{ color }}>{name}</span>;
}

/**
 * Returns an array equivalent to the given one, but with filler objects between every original value.
 *
 * @param array
 * @param filler
 */
const injectBetween = function<T>(array: T[], filler: () => T): T[] {
  const output: T[] = [];
  array.forEach((value, i) => {
    output.push(value);
    if (i < array.length - 1) {
      output.push(filler());
    }
  });
  return output;
};

function PlayerNames({ players, team }: { players: (PlayerSummary | undefined)[], team: number }) {
  if (players.length === 0) {
    return <></>;
  }

  return (
    <>
      {
        injectBetween(players.map((player) => {
          return (
            <PlayerName key={ player?.user_id } player={ player } team={ team }/>
          );
        }), () => { return (<>&nbsp;+&nbsp;</>); })
      }
    </>
  );
}

/**
 * Infers which teams all three players are on, in case only one or two are missing team information.
 * If all three players are missing team data, then the "other" team is returned for all of them.
 * Returns an array of the team for the killer and assister and the team for the victim, in that order.
 *
 * NOTE: This returns inaccurate results when players assist or kill players on their own team.
 *
 * @param killer the killing player
 * @param assister the assisting player (optional)
 * @param victim the dead player
 */
const inferTeams = function(killer: PlayerSummary | HighlightPlayerSnapshot, assister: PlayerSummary | HighlightPlayerSnapshot | null | undefined, victim: PlayerSummary | HighlightPlayerSnapshot): Team[] {
  let aggroTeam: Team = "other";
  let victimTeam: Team = "other";

  if (killer.team !== "other" && killer.team !== "spectator") {
    aggroTeam = killer.team as Team;
    switch (aggroTeam) {
      case "red":
        victimTeam = "blue";
        break;
      case "blue":
        victimTeam = "red";
        break;
    }
  } else if (assister !== null && assister !== undefined && assister?.team !== "other" && assister?.team !== "spectator") {
    aggroTeam = assister.team as Team;
    switch (aggroTeam) {
      case "red":
        victimTeam = "blue";
        break;
      case "blue":
        victimTeam = "red";
        break;
    }
  } else if (victim.team !== "other" && victim.team !== "spectator") {
    victimTeam = victim.team as Team;
    switch (victimTeam) {
      case "red":
        aggroTeam = "blue";
        break;
      case "blue":
        aggroTeam = "red";
        break;
    }
  }

  if (killer.user_id === victim.user_id || assister?.user_id === victim.user_id) {
    // suicide or self-assisted kill, unflip the victim team
    victimTeam = aggroTeam;
  }

  return [aggroTeam, victimTeam];
};

function KillHighlightBox(
  highlight: KillHighlight,
  playerMap: Map<UserId, PlayerSummary>
) {
  const { classes } = useStyles({ justifyContent: "right" });

  const { killer, assister, victim } = highlight;

  // Infer teams in case somebody doesn't have a team assigned.
  // This prevents displaying uncolored names in most cases
  const [aggroTeam, victimTeam] = inferTeams(killer, assister, victim);

  // Special case for kill messages with text instead of a kill icon
  if (highlight.kill_icon === "#fall") {
    return (
      <div className={classes.root}>
        <PlayerName player={victim} team={victimTeam}/>
        &nbsp;fell to a clumsy, painful death
      </div>
    );
  } else if (highlight.kill_icon === "#suicide") {
    return (
      <div className={classes.root}>
        <PlayerName player={victim} team={victimTeam} />
        &nbsp;bid farewell, cruel world!
      </div>
    );
  } else if (highlight.kill_icon === "#assisted_suicide") {
    return (
      <div className={classes.root}>
        <PlayerName player={killer} team={aggroTeam} />
        { assister !== null && assister !== undefined && assister?.user_id !== 0 && (
          <>
            &nbsp;+&nbsp;
            <PlayerName player={assister} team={aggroTeam}/>
          </>
        )}
        &nbsp;
        <b>finished off</b>
        &nbsp;
        <PlayerName player={victim} team={victimTeam}/>
      </div>
    );
  } else {
    return (
      <div className={classes.root}>
        { killer !== null && killer !== undefined && killer.user_id !== 0 && killer.user_id !== victim.user_id && <PlayerName player={killer} team={aggroTeam} />}
        { assister !== null && assister !== undefined && assister.user_id !== 0 && (
          <>
            &nbsp;+&nbsp;
            <PlayerName player={assister} team={aggroTeam}/>
          </>
        )}
        &nbsp;
        <KillIcon killIcon={highlight.kill_icon} />
        &nbsp;
        <PlayerName player={victim} team={victimTeam} />
      </div>
    );
  }
}

function ChatMessageHighlightBox(
  highlight: ChatMessageHighlight,
  playerMap: Map<UserId, PlayerSummary>
) {
  const { classes } = useStyles({ justifyContent: "left" });
  return (
    <div className={classes.root}>
      <PlayerName player={highlight.sender} />:&nbsp;
      {highlight.text}
    </div>
  );
}

function AirshotHighlightBox(
  highlight: AirshotHighlight,
  playerMap: Map<UserId, PlayerSummary>
) {
  const { classes } = useStyles({ justifyContent: "center" });
  const attackerName = highlight.attacker.name;
  const victimName = highlight.victim.name;
  return (
    <div className={classes.root}>
      AIRSHOT: {attackerName} airshot {victimName}
    </div>
  );
}

function CrossbowAirshotHighlightBox(
  highlight: CrossbowAirshotHighlight,
  playerMap: Map<UserId, PlayerSummary>
) {
  const { classes } = useStyles({ justifyContent: "center" });
  const healerName = highlight.healer.name;
  const targetName = highlight.target.name;
  return (
    <div className={classes.root}>
      AIRSHOT: {healerName} airshot {targetName}
    </div>
  );
}

function PointCapturedHighlightBox(
  highlight: PointCapturedHighlight,
  playerMap: Map<UserId, PlayerSummary>
) {
  const { classes } = useStyles({ justifyContent: "right" });

  const cappers = highlight.cappers.map((capper) => playerMap.get(capper));

  let icon;

  // For some reason the two capture icons are slightly
  // misaligned: The red variant has more empty pixels
  // on the right side of the icon.
  // Also, the colors of the icons come straight from the game
  // files and thus do not match the rest of the app's color
  // scheme.
  // TODO fix that.
  if (highlight.capturing_team === 2) {
    icon = "redcapture";
  } else if (highlight.capturing_team === 3) {
    icon = "bluecapture";
  }

  return (
    <div className={classes.root}>
      <PlayerNames players={cappers} team={highlight.capturing_team} />
      &nbsp;
      {icon !== undefined && <KillIcon killIcon={icon} />}
      captured {highlight.point_name}
    </div>
  );
}

function RoundStalemateHighlightBox() {
  const { classes } = useStyles({ justifyContent: "center" });
  return <div className={classes.root}>Round ended in a stalemate</div>;
}

function RoundStartHighlightBox() {
  const { classes } = useStyles({ justifyContent: "center" });
  return <div className={classes.root}>New round started</div>;
}

function RoundWinHighlightBox(highlight: RoundWinHighlight) {
  const { classes } = useStyles({ justifyContent: "center" });
  const team_number = highlight.winner;
  const teamName = TEAM_NAMES[team_number] ?? TEAM_NAMES[0];
  return <div className={classes.root}>{teamName} won the round</div>;
}

function PlayerConnectedHighlightBox(
  highlight: PlayerConnectedHighlight,
  playerMap: Map<UserId, PlayerSummary>
) {
  const { classes } = useStyles({ justifyContent: "left" });
  const playerName = playerMap.get(highlight.user_id)?.name ?? "<unknown>";

  return <div className={classes.root}>{playerName} has joined the game</div>;
}

function PlayerDisconnectedHighlightBox(
  highlight: PlayerDisconnectedHighlight,
  playerMap: Map<UserId, PlayerSummary>
) {
  const { classes } = useStyles({ justifyContent: "left" });
  const playerName = playerMap.get(highlight.user_id)?.name ?? "<unknown>";
  let reason = highlight.reason;
  if (reason === "#TF_MM_Generic_Kicked") {
    reason = "Removed from match by system";
  } else if (reason === "#TF_Idle_kicked") {
    reason = "Kicked due to inactivity";
  }
  return (
    <div className={classes.root}>
      {playerName} left the game ({reason})
    </div>
  );
}

function PauseHighlightBox() {
  const { classes } = useStyles({ justifyContent: "center" });
  return <div className={classes.root}>Game paused.</div>;
}

function UnpauseHighlightBox() {
  const { classes } = useStyles({ justifyContent: "center" });
  return <div className={classes.root}>Game resumed.</div>;
}

export default function HighlightBox({ event, playerMap }: HighlightProps) {
  if (event.t === "Kill") {
    return KillHighlightBox(event.c, playerMap);
  } else if (event.t === "ChatMessage") {
    return ChatMessageHighlightBox(event.c, playerMap);
  } else if (event.t === "Airshot") {
    return AirshotHighlightBox(event.c, playerMap);
  } else if (event.t === "CrossbowAirshot") {
    return CrossbowAirshotHighlightBox(event.c, playerMap);
  } else if (event.t === "PointCaptured") {
    return PointCapturedHighlightBox(event.c, playerMap);
  } else if (event.t === "RoundStalemate") {
    return RoundStalemateHighlightBox();
  } else if (event.t === "RoundStart") {
    return RoundStartHighlightBox();
  } else if (event.t === "RoundWin") {
    return RoundWinHighlightBox(event.c);
  } else if (event.t === "PlayerConnected") {
    return PlayerConnectedHighlightBox(event.c, playerMap);
  } else if (event.t === "PlayerDisconnected") {
    return PlayerDisconnectedHighlightBox(event.c, playerMap);
  } else if (event.t === "Pause") {
    return PauseHighlightBox();
  } else if (event.t === "Unpause") {
    return UnpauseHighlightBox();
  } else {
    console.error("unknown highlight:", event);
    return null;
  }
}
