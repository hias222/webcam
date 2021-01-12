import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import CircularProgress from '@material-ui/core/CircularProgress';

//https://github.com/Dirvann/webrtc-video-conference-simple-peer/blob/master/src/socketController.js

const Container = styled.div`
    padding: 0px;
    margin: 0px;
`;

const StyledVideo = styled.video`
    height: 100%;
    width: 1280px;
`;

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {

        props.peer.on('connect', () => {
            console.log("start connect" );
        })

        props.peer.on("stream", stream => {
            console.log("start stream" );
            ref.current.srcObject = stream;
        })

        props.peer.on('error', (err) => {
            console.log("error - " + err)
        })

        props.peer.on('close', () => {
            console.log("close peer")
        })

    });

    return (
        <StyledVideo playsInline autoPlay ref={ref} />
    );
}


const Watch = (props) => {
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const peersRef = useRef([]);
    const roomID = 'myroom'

    const [loading, setLoading] = React.useState(true);

    useEffect(() => {

        //alert('reload!')

        socketRef.current = io.connect(process.env.REACT_APP_WSURL, {
            path: "/peerws/socket.io"
        });
        console.log("connect to " + process.env.REACT_APP_WSURL)

        socketRef.current.emit("join room", roomID);

        socketRef.current.on("all users", users => {
            const peers = [];
            users.forEach(userID => {
                console.log("userid from " + socketRef.current.id + " to " + userID)

                const peer = createPeer(userID, socketRef.current.id);
                peersRef.current.push({
                    peerID: userID,
                    peer,
                })
                peers.push(peer);
            })
            setPeers(peers);
        })

        socketRef.current.on("receiving returned signal", payload => {
            console.log("receiving signal")
            const item = peersRef.current.find(p => p.peerID === payload.id);
            if (item.peer.readable) {
                item.peer.signal(payload.signal);
                setLoading(false);
            }
        });

        return function cleanup() {
            // delete from websockt!!

            var id = socketRef.current.id

            socketRef.current.emit("closing peer", {callerID: id})

            peersRef.current.map((peer) => {
                console.log("cleanup " + peer.peer)
                peer.peer.destroy();
            })
        }
        // })
    }, []);

    function createPeer(userToSignal, callerID) {
        console.log("create Peer")
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: false,
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

    function spinner() {
        if (loading) {
            return <CircularProgress />
        } else {
            return
        }
    }

    function message() {
        if (loading) {
            return <p>on long running use back in browser</p>
        } else {
            return
        }
    }

    return (
        <div>
            {spinner()}
            {message()}
            <Container>
                {peers.map((peer, index) => {
                    return (
                        <Video key={index} peer={peer} />
                    );
                })}
            </Container>

        </div>

    );
};

export default Watch;