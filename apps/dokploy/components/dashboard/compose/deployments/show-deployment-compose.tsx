import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { debounce } from "lodash";
import { SeparatorHorizontal } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
	logPath: string | null;
	serverId?: string;
	open: boolean;
	onClose: () => void;
}
export const ShowDeploymentCompose = ({
	logPath,
	open,
	onClose,
	serverId,
}: Props) => {
  const [data, setData] = useState("");
  const endOfLogsRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [initialScroll, setInitialScroll] = useState(true);

  useEffect(() => {
    if (!open || !logPath) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

		const wsUrl = `${protocol}//${window.location.host}/listen-deployment?logPath=${logPath}&serverId=${serverId}`;
		const ws = new WebSocket(wsUrl);

    ws.onmessage = (e) => {
      setData((currentData) => currentData + e.data);
    };

    return () => ws.close();
  }, [logPath, open]);

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

  const logSeparator =
    "\n =========================================================================================================== \n";

  const addSeparator = () => {
    setData((currentData) => currentData + logSeparator);
  };


  return (
    <Dialog
      open={open}
      onOpenChange={(e) => {
        onClose();
        if (!e) setData("");
      }}
    >
      <DialogContent className={"sm:max-w-5xl overflow-y-auto max-h-screen"}>
        <DialogHeader>
          <DialogTitle>Deployment</DialogTitle>
          <DialogDescription>
            See all the details of this deployment
          </DialogDescription>
          <div className="flex items-center justify-end gap-2 mr-8">
            <span className="text-sm">Auto Scroll</span>
            <Switch
              checked={autoScroll}
              onCheckedChange={(checked) => setAutoScroll(checked)}
            />
          </div>
        </DialogHeader>

        <div className="relative">
          <div
            className="text-wrap rounded-lg border p-4 text-sm sm:max-w-[59rem] h-[70vh] overflow-auto "
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
          <div className="absolute right-12 top-5 flex gap-2">
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
      </DialogContent>
    </Dialog>
  );
};
