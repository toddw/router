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

// @ts-ignore
if (typeof window === "undefined" && typeof global !== "undefined") {
  // @ts-ignore
  global.window = {
    addEventListener: () => undefined,
    location: {
      href: ""
    },
    history: {
      pushState: () => undefined,
    }
  }
}

// @ts-ignore
if (typeof URL === "undefined" && typeof global !== "undefined") {
  // @ts-ignore
  global.URL = (pathname) => ({
    pathname
  })
}

export function Route(_props: RouteProps) {
  return null;
}

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
  initialPath,
}: {
  children: ReactNode;
  ignoreSame?: boolean;
  initialPath?: string;
}) {
  const [path, setPath] = useState<string>(
    window.location.href ? new URL(window.location.href).pathname : initialPath || ""
  );

  useEffect(() => {
    const path = window.location.href ? new URL(window.location.href).pathname : initialPath || ""
    window.addEventListener("popstate", (event) => {
      if (event.state && event.state.path) {
        setPath(event.state.path);
      } else {
        setPath(path);
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
    window.history.pushState(
      { path: newPath, lastPath: path },
      newPath,
      newPath
    );
    setPath(newPath);
  }

  return {
    active: path,
    push,
  };
}

export function RouteMatcher({ children }: { children: ReactNode }) {
  const { path: currentPath } = useContext(RouteContext);
  const routes = Children.toArray(children) as ReactElement<RouteProps>[];
  const output: ReactNode[] = [];
  let matched = false;
  let i = 0;
  for (const el of routes) {
    if (el.type !== Route) {
      output.push(<React.Fragment key={i++}>{el}</React.Fragment>);
    } else if (!matched) {
      const {
        props: { path: matchPath, component: Component },
      } = el;
      const args = match(matchPath, currentPath);

      if (args) {
        matched = true;
        output.push(<Component key={i++} {...args} />);
      }
    }
  }

  return <>{output}</>;
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
