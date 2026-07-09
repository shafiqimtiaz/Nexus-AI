import { getRole } from "@/lib/auth";
import { CalendarView } from "@/components/calendar/calendar-view";

export const metadata = {
  title: "Calendar — Nexus",
};

export default async function CalendarPage() {
  const role = await getRole();
  return <CalendarView role={role} />;
}
