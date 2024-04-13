import { useRef } from "react";

import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";

import { ScrollArea, Text } from "@mantine/core";

import { GameSummary } from "@/demo";
import HighlightBox from "./HighlightBox";

export type TimelineProps = {
  gameSummary: GameSummary;
};

export default function HighlightsList({ gameSummary }: TimelineProps) {
  const listRef = useRef<FixedSizeList>(null);

  return (
    <AutoSizer>
      {({ height, width }) => (
        <ScrollArea
          style={{ width, height }}
          onScrollPositionChange={({ y }) => listRef.current?.scrollTo(y)}
        >
          <FixedSizeList
            height={height}
            width={width}
            style={{ overflow: "visible" }}
            itemCount={gameSummary.highlights.length}
            itemSize={40}
            ref={listRef}
          >
            {({ style, index }) => {
              const { event, tick } = gameSummary.highlights[index];
              return (
                <div
                  style={{ ...style, display: "flex", alignItems: "center" }}
                >
                  <Text
                    c="dimmed"
                    size="sm"
                    style={{
                      width: "7ch",
                      fontFamily: "monospace",
                      textAlign: "right",
                      paddingRight: 8,
                    }}
                  >
                    {tick}
                  </Text>
                  <HighlightBox event={event} />
                </div>
              );
            }}
          </FixedSizeList>
        </ScrollArea>
      )}
    </AutoSizer>
  );
}
