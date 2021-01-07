import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CreateRoom from "./routes/CreateRoom";
import ListDevices from './routes/ListDevices';
import Room from "./routes/Room";
import Serve from "./routes/Serve";
import Watch from './routes/Watch';

function App() {
  return (
    <BrowserRouter basename="/peer">
      <Switch>
        <Route path="/" exact component={CreateRoom} />
        <Route path="/room/:cameraID" component={Room} />
        <Route path="/devices" component={ListDevices} />
        <Route path="/serve/:cameraID" component={Serve} />
        <Route path="/watch" component={Watch} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
