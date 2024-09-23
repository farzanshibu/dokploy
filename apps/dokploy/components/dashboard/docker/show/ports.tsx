import { AnimatePresence, motion } from "framer-motion";
import { Box, ChevronDown, Globe } from "lucide-react";
import React from "react";

interface PortMapping {
  external: string;
  internal: string;
  protocol: string;
}

const parsePortMappings = (input: string): PortMapping[] => {
  const mappings = input.split(", ");
  return mappings
    .filter((mapping) => !mapping.startsWith(":::"))
    .map((mapping): PortMapping => {
      const parts = mapping.split("->");
      if (parts.length === 2) {
        // Case: external->internal/protocol
        const [external, internalWithProtocol] = parts;
        const [internal, protocol = ""] = (internalWithProtocol || "").split(
          "/"
        );
        const [host, extPort] = (external || "").split(":");
        return {
          external: external || "",
          internal: internal || "",
          protocol,
        };
      } else {
        // Case: port/protocol
        const [port, protocol = ""] = mapping.split("/");
        return {
          external: port || "",
          internal: port || "",
          protocol,
        };
      }
    });
};

interface PortMappingProps {
  external: string;
  internal: string;
  protocol: string;
}

const PortMapping: React.FC<PortMappingProps> = ({
  external,
  internal,
  protocol,
}) => (
  <div className="flex items-center space-x-2 rounded-lg shadow-sm justify-between">
    <Globe className="text-blue-500" size={10} />
    <span className="font-semibold text-slate-300 text-xs">{external}</span>
    <span className="text-slate-300 select-none">{`->`}</span>
    <Box className="text-green-500" size={10} />
    <span className="font-semibold text-slate-300 text-xs">{internal}</span>
    <span className="text-[10px]  text-gray-500 ml-2 uppercase select-none">
      {protocol}
    </span>
  </div>
);

interface PortIndicatorProps {
  input: string;
}

const PortIndicator: React.FC<PortIndicatorProps> = ({ input }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (input === "") {
    return null;
  }

  const portMappings = parsePortMappings(input);

  return (
    <div
      className="space-y-1 cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <AnimatePresence initial={false}>
        <div className="flex space-x-2 items-center text-slate-500">
          <div>
            {isExpanded
              ? portMappings.map((mapping, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.1, ease: "easeInOut" }}
                  >
                    <PortMapping {...mapping} />
                  </motion.div>
                ))
              : portMappings.slice(0, 2).map((mapping, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <PortMapping {...mapping} />
                  </motion.div>
                ))}
          </div>
          <div>
            {portMappings.length > 2 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="flex items-center justify-center space-x-1">
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <ChevronDown size={16} />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </AnimatePresence>
    </div>
  );
};
export { PortIndicator };
