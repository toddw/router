import React, {
  createContext,
  useContext,
  useState,
  Children,
  ReactNode,
  ReactElement,
  useEffect,
} from "react";

interface RouteProps {
  path: string;
  component: React.ComponentType<any>;
  onBefore: (args: any) => Promise<void>;
  onAfter: (args: any) => Promise<void>;
}

export const Route: React.FC<RouteProps> = () => {
  return null;
};

const RouteContext = createContext<{
  path: string;
  setPath: (path: string) => void;
}>({
  path: "",
  setPath: () => null,
});

export default function Router({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<string>(
    new URL(window.location.href).pathname
  );

  useEffect(() => {
    const initialPath = new URL(window.location.href).pathname;
    window.addEventListener("popstate", (event) => {
      if (event.state && event.state.path) {
        setPath(event.state.path);
      } else {
        setPath(initialPath);
      }
    });
  }, []);

  return (
    <RouteContext.Provider value={{ path, setPath }}>
      <RouteMatcher>{children}</RouteMatcher>
    </RouteContext.Provider>
  );
}

export function Link({
  children,
  to,
  ...other
}: {
  children: ReactNode;
  to: string;
  other: Record<string, any>;
}) {
  const { push } = useRouter();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    push(to);
  }

  return (
    <a href={to} onClick={handleClick} {...other}>
      {children}
    </a>
  );
}

export function useRouter() {
  const { path, setPath } = useContext(RouteContext);

  function push(newPath: string) {
    window.history.pushState({ path: newPath }, newPath, newPath);
    setPath(newPath);
  }

  return {
    active: path,
    push,
  };
}

function RouteMatcher({ children }: { children: ReactNode }) {
  const { path: currentPath } = useContext(RouteContext);
  const routes = Children.toArray(children) as ReactElement<RouteProps>[];
  for (const el of routes) {
    const {
      props: { path: matchPath, component: Component },
    } = el;
    const args = match(matchPath, currentPath);

    if (args) {
      return <Component {...args} />;
    }
  }

  return null;
}

function match(route: string, href: string) {
  const regexStr = route.replace(
    /\/:(\w+)/g,
    (_match, capture) => `/(?<${capture}>[^/]+)`
  );
  const regex = new RegExp(`^${regexStr}(?:\/(?!.))?$`);

  const args = href.match(regex);
  if (args) {
    return args.groups || {};
  }

  return null;
}
