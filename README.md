# Very Simple Router for React

For those that don't need the complexity of some of the existing solutions this is some basic routing.

# Example

```javascript
import React from "react";
import Router, { Route, Link, useRouter } from "@shipyard-media/router";

function LinkExample({ name }) {
  return (
    <>
      Hello {name}! The current page is {active}.
      <Link to="/bye/Todd">Say Goodbye!</Link>
    </>
  );
}

function HookExample() {
  const { active, push } = useRouter();
  return (
    <div>
      Goodbye!
      <button onClick={() => push("/hello/Ted")}>Say hi to Ted</button>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Route path="/hello/:name" component={LinkExample} />
      <Route path="/bye/:name" component={HookExample} />
      <Route path="/.*" component={() => <div>Catch All</div>} />
    </Router>
  );
}
```
