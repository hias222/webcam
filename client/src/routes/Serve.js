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
    const videoID = props.match.params.videoID;
    const audioID = props.match.params.audioID;


    useEffect(() => {
        socketRef.current = io.connect(process.env.REACT_APP_WSURL, {
            path: "/peerws/socket.io"
        });
        console.log("connect to " + process.env.REACT_APP_WSURL + ' video ' + videoID + ' audio ' + audioID)

        if (videoID !== 'false'){
            var videostring = {deviceId: { exact: videoID },
            width: { ideal: 1280 },
            height: { ideal: 720 }}
        } else {
            var videostring = false
        }

        if (audioID !== 'false'){
            var audiostring = {deviceId: { exact: audioID }}
        } else {
            var audiostring = false
        }

        navigator.mediaDevices.getUserMedia({
            video: videostring,
            audio: audiostring,
        }).then(stream => {
            userVideo.current.srcObject = stream;
            socketRef.current.emit("create serve", roomID);

            socketRef.current.on("user joined", payload => {
                console.log("user joined " + payload.callerID)
                const peer = addPeer(payload.signal, payload.callerID, stream);
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
        }).catch(error => {
            console.log("da geht nix " + error)
        })

        return function cleanup() {
            //cleanup Media
            //cleanup websocket todo
            console.log("cleanup " + videoID)
            userVideo.current.srcObject.getTracks().forEach(function (track) {
                //if (track.readyState == 'live') {
                track.stop();
                //}
            });
        }
    },[]);

    function addPeer(incomingSignal, callerID, stream) {
        console.log("add Peer " + callerID)
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            console.log("returning signal " + callerID)
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
