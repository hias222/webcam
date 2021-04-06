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

const Stream = (props) => {
    //const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const roomID = props.match.params.roomID;
    const videoID = props.match.params.videoID;
    const audioID = props.match.params.audioID;

    useEffect(() => {
        socketRef.current = io.connect(process.env.REACT_APP_WSURL, {
            path: "/peerws/socket.io"
        });

        console.log("connect to " + process.env.REACT_APP_WSURL + ' video ' + videoID + ' audio ' + audioID)

        var videostring = (videoID !== 'false') ? { deviceId: { exact: videoID }, width: { ideal: 1280 }, height: { ideal: 720 } } : false
        var audiostring = (audioID !== 'false') ? { deviceId: { exact: audioID } } : false

        navigator.mediaDevices.getUserMedia({
            video: videostring,
            audio: audiostring,
        }).then(stream => {
            userVideo.current.srcObject = stream;

            socketRef.current.emit("create serve", roomID);

            socketRef.current.on("new user", payload => {
                console.log("new user " + payload.callerID)
                const peer = createPeer(payload.callerID, socketRef.current.id, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                })
               // setPeers(users => [...users, peer]);
            });

            socketRef.current.on("receiving returned signal", payload => {
                console.log("receiving returned signal")
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });

        }).catch(error => {
            console.log("da geht nix " + error)
        })

        socketRef.current.on('removePeer', (payload) => {
            console.log('GOT DISCONNECTED ')
            const item = peersRef.current.find(p => p.peerID === payload.callerID);
            console.log(item)
            if (item) {
                item.peer.destroy();
                console.log("deleted peer ")
            }
        })

        return function cleanup() {
            console.log("cleanup " + videoID)
            userVideo.current.srcObject.getTracks().forEach(function (track) {
                //if (track.readyState == 'live') {
                track.stop();
                //}
            });
        }
        // eslint-disable-next-line
    }, []);

    function createPeer(userToSignal, callerID, stream) {
        console.log("create Peer")
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            console.log("sending signal from " + callerID + " to " + userToSignal)
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })

        peer.on('error', (err) => {
            var tmp = err.message;
            console.log("error - " + callerID + " " + tmp)
        })

        peer.on('close', () => {
            console.log("close peer " + callerID)
        })

        return peer;
    }

    return (
        <Container>
            <StyledVideo muted ref={userVideo} autoPlay playsInline />
        </Container>
    );
};

export default Stream;
