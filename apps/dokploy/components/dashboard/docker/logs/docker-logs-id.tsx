import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { debounce } from "lodash";
import { SeparatorHorizontal } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FC } from "react";

interface Props {
	id: string;
	containerId: string;
	serverId?: string | null;
}

export const DockerLogsId: FC<Props> = ({
	id,
	containerId,
	serverId,
}) => {
  const [data, setData] = useState<string>("");
  const [lines, setLines] = useState<number>(40);
  const [inputValue, setInputValue] = useState<string>("40");
  const [autoScroll, setAutoScroll] = useState<boolean>(false);
  const [initialScroll, setInitialScroll] = useState<boolean>(true);
  const endOfLogsRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/docker-container-logs?containerId=${containerId}&tail=${lines}${serverId ? `&serverId=${serverId}` : ""}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (e) => {
      setData((currentData) => currentData + e.data);
    };

    return () => ws.close();
  }, [containerId, lines]);

  const scrollToBottom = () => {
    endOfLogsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [data, autoScroll]);

  const handleScrollDebounced = useCallback(
    debounce(() => {
      const container = logsContainerRef.current;
      if (!container) return;
      const isAtBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 5;
      if (initialScroll && !isAtBottom) {
        setInitialScroll(false);
        return;
      }
      setAutoScroll(isAtBottom);
    }, 100),
    [initialScroll]
  );

  const debouncedSetLines = useCallback(
    debounce((newLines: number) => setLines(newLines), 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetLines.cancel();
    };
  }, [debouncedSetLines]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const parsedValue = Number(value);
    if (!isNaN(parsedValue) && parsedValue > 0) {
      debouncedSetLines(parsedValue);
    }
  };

  const logSeparator =
    "\n =========================================================================================================================================== \n";

  const addSeparator = () => {
    setData((currentData) => currentData + logSeparator);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="lines-input">
          <span>Number of lines to show</span>
        </Label>
        <Input
          id="lines-input"
          type="number"
          placeholder="Number of lines to show (Defaults to 40)"
          value={inputValue}
          onChange={handleInputChange}
          min="1"
          step="1"
        />
        <div className="flex items-center justify-end gap-3 pt-3 mr-3 px-2">
          <span className="text-sm">Auto Scroll</span>
          <Switch
            checked={autoScroll}
            onCheckedChange={(checked) => setAutoScroll(checked)}
          />
        </div>
      </div>

      <div className="relative">
        <div
          className="text-wrap rounded-lg border px-4 text-sm h-[70vh] overflow-auto bg-[#19191A]"
          ref={logsContainerRef}
          onScroll={handleScrollDebounced}
        >
          <code>
            <pre className="whitespace-pre-wrap break-words font-mono text-green-700">
              {data || "Loading..."}
            </pre>
            <div ref={endOfLogsRef} />
          </code>
        </div>
        <div className="absolute right-5 top-5 flex gap-2">
          <Button
            variant="secondary"
            onClick={addSeparator}
            className="btn btn-primary w-auto z-50"
          >
            <SeparatorHorizontal size={16} />
          </Button>
          <Button
            variant="secondary"
            onClick={scrollToBottom}
            className="btn btn-primary w-auto z-50"
          >
            Scroll to bottom
          </Button>
        </div>
      </div>
    </div>
  );
};
