import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/utils/api";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AddSecurity } from "./add-security";
import { DeleteSecurity } from "./delete-security";
import { UpdateSecurity } from "./update-security";
interface Props {
  applicationId: string;
}

export const ShowSecurity = ({ applicationId }: Props) => {
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard");
    });
  };
  const { data } = api.application.one.useQuery(
    {
      applicationId,
    },
    { enabled: !!applicationId }
  );

  return (
    <Card className="bg-background">
      <CardHeader className="flex flex-row justify-between flex-wrap gap-4">
        <div>
          <CardTitle className="text-xl">Security</CardTitle>
          <CardDescription>Add basic auth to your application</CardDescription>
        </div>

        {data && data?.security.length > 0 && (
          <AddSecurity applicationId={applicationId}>Add Security</AddSecurity>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {data?.security.length === 0 ? (
          <div className="flex w-full flex-col items-center justify-center gap-3 pt-10">
            <LockKeyhole className="size-8 text-muted-foreground" />
            <span className="text-base text-muted-foreground">
              No security configured
            </span>
            <AddSecurity applicationId={applicationId}>
              Add Security
            </AddSecurity>
          </div>
        ) : (
          <div className="flex flex-col pt-2">
            <div className="flex flex-col gap-6 ">
              {data?.security.map((security) => (
                <div key={security.securityId}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border rounded-lg p-4 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">Username</span>
                        <span
                          className="text-sm text-muted-foreground cursor-pointer truncate"
                          onClick={() => copyToClipboard(security.username)}
                          title={security.username}
                        >
                          {security.username}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">Password</span>
                        <div className="flex items-center">
                          <span
                            className="text-sm text-muted-foreground cursor-pointer truncate"
                            onClick={() => copyToClipboard(security.password)}
                            title={
                              showPassword
                                ? security.password
                                : "Click to copy password"
                            }
                          >
                            {showPassword ? security.password : "•".repeat(16)}
                          </span>
                          <button
                            className="ml-2 flex-shrink-0"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row gap-2 sm:flex-shrink-0">
                      <UpdateSecurity securityId={security.securityId} />
                      <DeleteSecurity securityId={security.securityId} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
