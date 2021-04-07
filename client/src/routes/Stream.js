import React, { useEffect, useRef } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

const Container = styled.div`
padding: 0px;
margin: 0px;
`;

const StyledVideo = styled.video`
height: 100%;
`;

//width: 1280px;

const Stream = (props) => {
    //const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const roomID = props.match.params.roomID;
    const videoID = props.match.params.videoID;
    const audioID = props.match.params.audioID;
    const resolutionID = props.match.params.resolutionID;

    useEffect(() => {
        socketRef.current = io.connect(process.env.REACT_APP_WSURL, {
            path: "/peerws/socket.io"
        });

        console.log("connect to " + process.env.REACT_APP_WSURL + ' video ' + videoID + ' audio ' + audioID + ' resolution ' + resolutionID)
  
        switch (resolutionID) {
            case '720':
                console.log('720p')
                var videostring = (videoID !== 'false') ? { deviceId: { exact: videoID }, width: { exact: 1280 }, height: { exact: 720 } } : false
                break;
            case '1080':
                console.log('1080p')
                var videostring = (videoID !== 'false') ? { deviceId: { exact: videoID }, width: { exact: 1920 }, height: { exact: 1080 } } : false
                break;
            case '575':
                console.log('575p')
                var videostring = (videoID !== 'false') ? { deviceId: { exact: videoID }, width: { exact: 1024 }, height: { exact: 576 } } : false
                break;
            default:
                console.log('resolution default')
                var videostring = (videoID !== 'false') ? { deviceId: { exact: videoID }, width: { min: 1024 }, height: { min: 576 } } : false
                break;
        }

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
