import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "pending" | "approved" | "rejected" | "reimbursed";

interface StatusBadgeProps {
  status: Status;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-pending text-pending-foreground",
    },
    approved: {
      label: "Approved",
      className: "bg-approved text-approved-foreground",
    },
    rejected: {
      label: "Rejected",
      className: "bg-rejected text-rejected-foreground",
    },
    reimbursed: {
      label: "Reimbursed",
      className: "bg-reimbursed text-reimbursed-foreground",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
};
