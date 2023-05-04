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
  ignoreSame: boolean;
}>({
  path: "",
  setPath: () => null,
  ignoreSame: true,
});

export default function Router({
  children,
  ignoreSame = true,
}: {
  children: ReactNode;
  ignoreSame?: boolean;
}) {
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
    <RouteContext.Provider value={{ path, setPath, ignoreSame }}>
      <RouteMatcher>{children}</RouteMatcher>
    </RouteContext.Provider>
  );
}

export function Link({
  children,
  to,
  ...other
}:
  | {
      children: ReactNode;
      to: string;
    }
  | Record<string, any>) {
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
  const { path, setPath, ignoreSame } = useContext(RouteContext);

  function push(newPath: string) {
    // Default behavior is to not push the state if it's going ot the exact
    // same place. Change this with <Router ignoreSame={false}>
    if (newPath === path && ignoreSame) {
      return;
    }
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
