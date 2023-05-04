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
    window.addEventListener("popstate", (event) => {
      setPath(event.state.path);
    });
  }, []);

  return (
    <RouteContext.Provider value={{ path, setPath }}>
      <RouteMatcher>{children}</RouteMatcher>
    </RouteContext.Provider>
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
