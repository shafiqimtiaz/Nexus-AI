import { getRole } from "@/lib/auth";
import { ResourcesView } from "@/components/resources/resources-view";

export const metadata = {
  title: "Resources — Nexus",
};

export default async function ResourcesPage() {
  const role = await getRole();
  return <ResourcesView role={role} />;
}
