import React, { useEffect, useRef, useState } from "react";

import { useHistory } from "react-router-dom";

import { Button, Grid } from "@material-ui/core";
import styled from "styled-components";

const Container = styled.div`
    padding: 20px;
    display: flex;
    height: 100vh;
    width: 90%;
    margin: auto;
    flex-wrap: wrap;
`;

const StyledVideo = styled.video`
    height: 40%;
    width: 50%;
`;


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
    }, []);

    return (
        <div>
            <p> device list {mydevices.length} <br></br></p>
            {mydevices.map((device, index) => {
                return (
                    <div>
                        <Grid key={index}>
                            <Button onClick={() => { create(device.deviceId) }} >Press</Button>
                            <p key={index}>{device.label}</p>
                        </Grid>
                    </div>
                );
            })}
            <Container>
                <StyledVideo muted ref={userVideo} autoPlay playsInline />
            </Container>
        </div>
    );
};

export default ListDevices;