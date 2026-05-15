import React from "react";

const navItems = [
  ["#/dashboard", "Dashboard"],
  ["#/tickets", "Tickets"],
  ["#/create", "Create Ticket"],
  ["#/reports", "Reports"]
];

export default function AppShell({ route, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Service Desk</p>
          <h1>IT Help Desk</h1>
        </div>
        <nav>
          {navItems.map(([href, label]) => (
            <a key={href} className={route === href.slice(1) ? "active" : ""} href={href}>
              {label}
            </a>
          ))}
        </nav>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
