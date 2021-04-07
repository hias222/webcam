import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import ListDevices from './routes/ListDevices';
import Stream from "./routes/Stream";
import Viewer from './routes/Viewer';

function App() {
  return (
    <BrowserRouter basename="/peer">
      <Switch>
        <Route path="/" exact component={ListDevices} />
        <Route path="/stream/:roomID/:videoID/:audioID/:resolutionID" component={Stream} />
        <Route path="/view/:roomID/:resolutionID" component={Viewer} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
