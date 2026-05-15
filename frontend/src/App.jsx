import { useEffect, useState } from "react";
import AppShell from "./components/AppShell.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import TicketList from "./pages/TicketList.jsx";
import TicketDetails from "./pages/TicketDetails.jsx";
import CreateTicket from "./pages/CreateTicket.jsx";
import Reports from "./pages/Reports.jsx";

function getRoute() {
  return window.location.hash.replace("#", "") || "/dashboard";
}

export default function App() {
  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);
    if (!window.location.hash) window.location.hash = "/dashboard";
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const ticketMatch = route.match(/^\/tickets\/(\d+)$/);
  let page = <Dashboard />;

  if (route === "/tickets") page = <TicketList />;
  if (route === "/create") page = <CreateTicket />;
  if (route === "/reports") page = <Reports />;
  if (ticketMatch) page = <TicketDetails ticketId={ticketMatch[1]} />;

  return <AppShell route={route}>{page}</AppShell>;
}
