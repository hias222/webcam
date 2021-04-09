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
`;

const StyledVideo720 = styled.video`
    height: 100%; 
    width: 1280px;
`;

const StyledVideo1080 = styled.video`
    height: 100%; 
    width: 1920px;
`;

const StyledVideo575 = styled.video`
    height: 100%; 
    width: 1024px;
`;


const Video = (props) => {
    const ref = useRef(props.peer);

    useEffect(() => {

        // console.log("resolution " + props.resolutionID)

        props.peer.on('connect', () => {
            console.log("start video");
        })

        props.peer.on("stream", stream => {
            console.log("start stream");
            ref.current.srcObject = stream;
            ref.current.focus()
        })

        props.peer.on('error', (err) => {
            console.log("error - " + err)
        })

        props.peer.on('close', () => {
            console.log("close peer")
        })

        return function cleanup() {
            console.log("cleanup in video")
            //props.peer.destroy();
        }

    }, []);


    function getdefVideo() {
        switch (props.resolutionID) {
            case '720':
                console.log('720p')
                return < StyledVideo720 playsInline autoPlay ref={ref} />
            case '1080':
                console.log('1080p')
                return < StyledVideo1080 playsInline autoPlay ref={ref} />
            case '575':
                console.log('575p')
                return < StyledVideo575 playsInline autoPlay ref={ref} />
            default:
                console.log('resolution default')
                return < StyledVideo playsInline autoPlay ref={ref} />
        }
    }

    return (
        getdefVideo()
        //<StyledVideo playsInline autoPlay ref={ref} />
    );

}

const Viewer = (props) => {
    const [peer, setPeer] = useState();
    const socketRef = useRef();
    const peersRef = useRef([]);
    const roomID = props.match.params.roomID;
    const resolutionID = props.match.params.resolutionID;

    const ref = useRef();

    const [loading, setLoading] = React.useState(true);

    useEffect(() => {

        console.log("start with " + roomID + " - " + resolutionID)
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
            setPeer(peer);
        });


        socketRef.current.on("removePeer", payload => {
            console.log("removePeer")
            console.log(payload)
        });

        return function cleanup() {
            var id = socketRef.current.id
            socketRef.current.emit("closing peer", { callerID: id })

            if (peer != undefined) {
                peer.peer.destroy();
            }

            clearInterval(interval);
        }
    }, []);

    function sendTicker() {
        var id = socketRef.current.id
        var date = Date.now()
        socketRef.current.emit("keep alive", { callerID: id, date: date });
    }

    function addPeer(incomingSignal, callerID) {
        console.log("add peer")
        const peer = new Peer({
            initiator: false,
            config: { iceServers: [] },
            //trickle: false,
        })

        peer.on("signal", signal => {
            setLoading(false);
            console.log("add peer get signal " + signal.type)
            if (signal.type === 'answer') {
                console.log("answer")
                socketRef.current.emit("returning signal", { signal, callerID })
            }

        })

        peer.on('error', (err) => {
            var tmp = err.message;
            console.log(tmp)
        })

        peer.on('close', () => {
            console.log("close peer to " + callerID + " " + peer)
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
        console.log("showvideo ")
        var videos = ''
        if (peer != undefined) {
            console.log(peer)
            videos = <Video key={1} peer={peer} resolutionID={resolutionID} />
        }
        return videos;
    }

    return (
        <div>
            <Container>
                {spinner()}
                {message()}
                {showvideo()}
            </Container>
        </div>

    );
};

export default Viewer;