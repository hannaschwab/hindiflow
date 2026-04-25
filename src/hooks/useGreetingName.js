import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useGreetingName() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const greetingName = user?.greeting_name || "";

  const saveName = async (name) => {
    await base44.auth.updateMe({ greeting_name: name });
    queryClient.invalidateQueries({ queryKey: ["me"] });
  };

  return { greetingName, isLoading, saveName, user };
}