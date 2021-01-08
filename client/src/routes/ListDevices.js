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
                    /*
                    navigator.mediaDevices.getUserMedia({
                        video: {
                            deviceId: { exact: device.deviceId }
                        },
                        audio: false
                    }).then(() => {
                           console.log("added")
                    })
                    */
                }
                //console.log(device.kind + ": " + device.label +
                //  " id = " + device.deviceId);
            });
            setMydevices(localdevices)
        })

        /*
        return function cleanup() {
            //cleanup Media
            mydevices.map((device, index) => {

                navigator.mediaDevices.getUserMedia({
                    video: {
                        deviceId: { exact: device.deviceId }
                    },
                    audio: false
                }).then((stream) => {
                    console.log("cleanup " + device.deviceId)
                    stream.getTracks().forEach(function(track) {
                        if (track.readyState == 'live') {
                            track.stop();
                        }
                    });
                })
                console.log("cleanup " + device.deviceId)
            })
        }
        */
    });

    return (
        <div>
            <p> device list {mydevices.length} <br></br></p>
            {mydevices.map((device, index) => {
                return (
                    <div key={index + 2000}>
                        <Grid container key={index + 1000} >
                            <Grid item xs={6} key={index + 111}>
                                <Button onClick={() => { serve(device.deviceId) }} >Play {device.index} {device.deviceId}</Button>
                            </Grid>
                            <Grid item xs={6} key={index}>
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
