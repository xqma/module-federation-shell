import React from 'react';
import logo from './logo.svg';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import './App.css';

// const RemoteButton = React.lazy(() => import("page1/TestPage1"));

function loadComponent(scope: any, module: any) {
  return async () => {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    // @ts-ignore
    await __webpack_init_sharing__('default');
    // @ts-ignore
    const container = window[scope]; // or get the container somewhere else
    // Initialize the container, it may provide shared modules
    // @ts-ignore
    await container.init(__webpack_share_scopes__.default);
    // @ts-ignore
    const factory = await window[scope].get(module);
    const Module = factory();
    return Module;
  };
}

const useDynamicScript = (args: any) => {
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (!args.url) {
      return;
    }

    const element = document.createElement('script');

    element.src = args.url;
    element.type = 'text/javascript';
    element.async = true;

    setReady(false);
    setFailed(false);

    element.onload = () => {
      console.log(`Dynamic Script Loaded: ${args.url}`);
      setReady(true);
    };

    element.onerror = () => {
      console.error(`Dynamic Script Error: ${args.url}`);
      setReady(false);
      setFailed(true);
    };

    document.head.appendChild(element);

    return () => {
      console.log(`Dynamic Script Removed: ${args.url}`);
      document.head.removeChild(element);
    };
  }, [args.url]);

  return {
    ready,
    failed,
  };
};

function System(props: any) {
  const { ready, failed } = useDynamicScript({
    url: props.system && props.system.url,
  });

  if (!props.system) {
    return <h2>Not system specified</h2>;
  }

  if (!ready) {
    return <h2>Loading dynamic script: {props.system.url}</h2>;
  }

  if (failed) {
    return <h2>Failed to load dynamic script: {props.system.url}</h2>;
  }

  const Component = React.lazy(loadComponent(props.system.scope, props.system.module));
  console.log(props.system.props);
  return (
    <React.Suspense fallback="Loading System">
      <Component props={props.system.props}/>
    </React.Suspense>
  );
}

function TestPage1() {
  return (
    <div>
      <p>This is shell!</p>
      <React.Suspense fallback="Loading Button">
        <System system={{
          url: 'http://localhost:3001/remoteEntry.js',
          scope: 'page1',
          module: './TestPage1',
          props: {
            name: 'Xiaoqi'
          }
        }} />
      </React.Suspense>
    </div>
  );
}

function TestPage2() {
  return (
    <div>
      <p>This is shell!</p>
      <React.Suspense fallback="Loading Button">
        <System system={{
          url: 'http://localhost:3003/remoteEntry.js',
          scope: 'page2',
          module: './TestPage2',
          props: {
            name: 'Yunling'
          }
        }} />
      </React.Suspense>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/users">Users</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/about" element={<TestPage2 />} />
          <Route path="/" element={<TestPage1 />} />
        </Routes>
      </div>
    </Router>
    
  );
}

export default App;
