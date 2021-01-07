import React, { useEffect, useRef, useState } from "react";
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

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
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

    useEffect(() => {
        socketRef.current = io.connect(process.env.REACT_APP_WSURL, {
            path: "/peerws/socket.io"
        });
        console.log("connect to " + process.env.REACT_APP_WSURL)
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
        }).then(() => {
            //userVideo.current.srcObject = stream;
            socketRef.current.emit("join room", roomID);
            socketRef.current.on("all users", users => {
                const peers = [];
                users.forEach(userID => {
                    console.log("userid " + userID)
                    const peer = createPeer(userID, socketRef.current.id);
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                    })
                    peers.push(peer);
                })
                setPeers(peers);
            })

            /*
            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                })

                //setPeers(users => [...users, peer]);
            });
            */

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });
        })
    }, []);

    function createPeer(userToSignal, callerID) {
        console.log("create init")
        const peer = new Peer({
            initiator: true,
            trickle: false,
        });

        peer.on("signal", signal => {
            console.log("create init - send")
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    return (
        <Container>
            {peers.map((peer, index) => {
                return (
                    <Video key={index} peer={peer} />
                );
            })}
        </Container>
    );
};

export default Watch;