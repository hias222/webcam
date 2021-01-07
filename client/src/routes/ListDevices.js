import React, { useEffect, useRef, useState } from "react";

import { useHistory } from "react-router-dom";

import { Button, Grid } from "@material-ui/core";


const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const ListDevices = (props) => {
    const userVideo = useRef();
    const [mydevices, setMydevices] = useState([]);
    const localdevices = [];

    const history = useHistory();

    function create(cameraID) {
        history.push(`/room/${cameraID}`);
    }


    function serve(cameraID) {
        history.push(`/serve/${cameraID}`);
    }

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(devices => {
            devices.forEach(function (device) {
                if (device.kind === 'videoinput') {
                    localdevices.push(device)
                }
                console.log(device.kind + ": " + device.label +
                    " id = " + device.deviceId);
            });
            setMydevices(localdevices)
        })

        /*
        video: videoConstraints
        video: { width: 1280, height: 720 }
        { video: { deviceId: myPreferredCameraDeviceId } }
        { video: { deviceId: { exact: myExactCameraOrBustDeviceId } } }

        video: {
    width: { min: 1280 },
    height: { min: 720 }
  }
        */

        navigator.mediaDevices.getUserMedia({
            video: videoConstraints, audio: false
        })
            .then(stream => {
                userVideo.current.srcObject = stream;
            })
            .catch(error => {
                console.log('not found ' + error.toString())
            })
    });

    return (
        <div>
            <p> device list {mydevices.length} <br></br></p>
            {mydevices.map((device, index) => {
                return (
                    <div>
                        <Grid container>
                            <Grid xs={6} key={index}>
                                <Button onClick={() => { serve(device.deviceId) }} >Play {device.label}</Button>
                            </Grid>
                            <Grid xs={6} key={index}>
                                <Button onClick={() => { create(device.deviceId) }} >Room {device.label}</Button>
                            </Grid>
                        </Grid>
                    </div>
                );
            })}
            
        </div>
    );
};

export default ListDevices;
