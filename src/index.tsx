import React, { Children, ReactNode, ReactElement } from "react";

interface RouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export const Route: React.FC<RouteProps> = () => {
  return null;
};

export default function Router({ children }: { children: ReactNode }) {
  const url = new URL(window.location.href);
  const routes = Children.toArray(children) as ReactElement<RouteProps>[];
  for (const el of routes) {
    const {
      props: { path, component: Component },
    } = el;
    const args = match(path, url);

    if (args) {
      return <Component {...args} />;
    }
  }

  return null;
}

export function match(route: string, url: URL) {
  const regexStr = route.replace(
    /\/:(\w+)/g,
    (_match, capture) => `/(?<${capture}>[^/]+)`
  );
  const regex = new RegExp(`^${regexStr}(?:\/(?!.))?$`);

  const path = url.pathname;
  const args = path.match(regex);
  if (args) {
    return args.groups || {};
  }

  return null;
}
