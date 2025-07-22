import { Check, CircleAlert } from "lucide-react";

export enum StatusType {
  SUCCESS = "Success",
  INFO = "Info",
  ERROR = "Error",
  LOADING = "Loading",
}

interface Props {
  message: string;
  statusType: StatusType;
}

function getStatusIcon(statusType: StatusType) {
  switch (statusType) {
    case StatusType.SUCCESS:
      return <Check className="size-4 text-green-600" />;
    case StatusType.INFO:
      return <CircleAlert className="size-4 text-gray-500" />;
    case StatusType.ERROR:
      return <Check className="size-4 text-red-600" />;
    case StatusType.LOADING:
      return <Check className="size-4 text-blue-400" />;
  }
}

function getStatusBackgroundStyle(statusType: StatusType) {
  switch (statusType) {
    case StatusType.SUCCESS:
      return "bg-green-600/10";
    case StatusType.INFO:
      return "bg-gray-500/10";
    case StatusType.ERROR:
      return "bg-red-600/10";
    case StatusType.LOADING:
      return "bg-blue-400/10";
  }
}

function getStatusTextStyle(statusType: StatusType) {
  switch (statusType) {
    case StatusType.SUCCESS:
      return "text-green-600";
    case StatusType.INFO:
      return "text-gray-500";
    case StatusType.ERROR:
      return "text-red-600";
    case StatusType.LOADING:
      return "text-blue-400";
  }
}

export default function StatusBar({
  message,
  statusType = StatusType.INFO,
}: Props) {
  return (
    <div
      className={`absolute bottom-4 w-96 flex items-center gap-2 rounded-full ${getStatusBackgroundStyle(statusType)} px-4 py-2`}
    >
      {getStatusIcon(statusType)}
      <div className={`text-sm ${getStatusTextStyle(statusType)}`}>
        {message}
      </div>
    </div>
  );
}
