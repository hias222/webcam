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
            console.log("start video");
        })

        props.peer.on("stream", stream => {
            console.log("start stream");
            ref.current.srcObject = stream;
        })

        props.peer.on('error', (err) => {
            console.log("error - " + err)
        })

        props.peer.on('close', () => {
            console.log("close peer")
        })

        return function cleanup() {
            console.log("cleanup in video")
            props.peer.destroy();
        }

    }, []);

    return (
        <StyledVideo playsInline autoPlay ref={ref} />
    );
}


const Viewer = (props) => {
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const peersRef = useRef([]);
    const roomID = props.match.params.roomID;

    const [loading, setLoading] = React.useState(true);

    useEffect(() => {

        //alert('reload!')

        const interval = setInterval(() => {
            sendTicker()
        }, 30000);

        socketRef.current = io.connect(process.env.REACT_APP_WSURL, {
            path: "/peerws/socket.io"
        });

        console.log("connect to " + process.env.REACT_APP_WSURL)

        socketRef.current.emit("join room", roomID);

        socketRef.current.on("user joined", payload => {
            console.log("user joined " + payload.callerID)
            const peer = addPeer(payload.signal, payload.callerID);
            peersRef.current.push({
                peerID: payload.callerID,
                peer,
            })
            setPeers(users => [...users, peer]);
        });


        socketRef.current.on("removePeer", payload => {
            console.log("removePeer")
            console.log(payload)

        });

        return function cleanup() {
            // delete from websockt!!

            var id = socketRef.current.id

            socketRef.current.emit("closing peer", { callerID: id })

            peers.map((peer) => {
                console.log("cleanup " + peer.peer)
                peer.peer.destroy();
            })

            setPeers([]);

            clearInterval(interval);

            //peersRef.current.map((peer) => {
            //    console.log("cleanup " + peer.peer)
            //    peer.peer.destroy();
            //})

        }
    }, []);

    function sendTicker(){
        var id = socketRef.current.id
        var date = Date.now()
        socketRef.current.emit("keep alive", { callerID: id , date: date});
    }

    function addPeer(incomingSignal, callerID) {
        console.log("add peer")
        const peer = new Peer({
            initiator: false,
            trickle: false,
        })

        peer.on("signal", signal => {
            setLoading(false);
            console.log("get signal")
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.on('error', (err) => {
            var tmp = err.message;
            console.log(tmp)
        })

        peer.on('close', () => {
            console.log("close peer " + callerID)
        })

        peer.signal(incomingSignal);

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

    function showvideo() {
        console.log("showvideo")
        var videos = ''
        peers.map((peer, index) => {
            videos = <Video key={index} peer={peer} />
        })
        return videos;
    }

    return (
        <div>
            {spinner()}
            {message()}
            <Container>
                {showvideo()}
            </Container>

        </div>

    );
};

export default Viewer;