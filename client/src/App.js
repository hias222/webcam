import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import ListDevices from './routes/ListDevices';
import Stream from "./routes/Stream";
import Viewer from './routes/Viewer';
import Start from './routes/Start'
import ViewDevices from './routes/ViewDevices'

function App() {
  return (
    <BrowserRouter basename="/peer">
      <Switch>
        <Route path="/" exact component={Start} />
        <Route path="/getserve" exact component={ListDevices} />
        <Route path="/getview" exact component={ViewDevices} />
        <Route path="/stream/:roomID/:videoID/:audioID/:resolutionID" component={Stream} />
        <Route path="/view/:roomID/:resolutionID" component={Viewer} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
