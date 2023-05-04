# Very Simple Router for React

For those that don't need the complexity of some of the existing solutions this is some basic routing.

# Example

```typescript
import React from "react";
import Router, { Route, useRouter } from "@shipyard-media/router";

function Greeter({ name }: { name: string }) {
  const { active, push } = useRouter();
  return (
    <div>
      Hello {name}!<br />
      Current page {active} <br />
      <button onClick={() => push("/hello/Todd")}>Say hi to Todd</button>
      <button onClick={() => push("/hello/Ted")}>Say hi to Ted</button>
      <button onClick={() => push("/hello/Tom")}>Say hi to Tom</button>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Route path="/hello/:name" component={Greeter} />
      <Route path="/.*" component={() => <div>Catch All</div>} />
    </Router>
  );
}
```
