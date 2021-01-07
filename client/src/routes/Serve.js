import React, { useEffect, useRef } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
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
    height: 100%;
    width: 100%;
`;

const Serve = (props) => {
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const roomID = 'myroom'
    const cameraID = props.match.params.cameraID;

    useEffect(() => {
        socketRef.current = io.connect(process.env.REACT_APP_WSURL, {
            path: "/peerws/socket.io"
        });
        console.log("connect to " + process.env.REACT_APP_WSURL + ' with ' + cameraID)
        navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: { exact: cameraID },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false,
        }).then(stream => {
            userVideo.current.srcObject = stream;
            socketRef.current.emit("join room", roomID);

            socketRef.current.on("user joined", payload => {
                console.log("user joined " + payload.callerID)
                const peer = addPeer(payload.signal, payload.callerID, stream);
                console.log("user joined " + payload.callerID)
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                })

                //setPeers(users => [...users, peer]);
            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });
        })
    });

    function addPeer(incomingSignal, callerID, stream) {
        console.log("add Peer " + callerID)
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    return (
        <Container>
            <StyledVideo muted ref={userVideo} autoPlay playsInline />
        </Container>
    );
};

export default Serve;
