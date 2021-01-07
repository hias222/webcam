import React from "react";
import { v1 as uuid } from "uuid";
import styled from "styled-components";

const Container = styled.div`
    padding: 20px;
    display: flex;
    width: 90%;
    margin: auto;
    flex-wrap: wrap;
`;

const CreateRoom = (props) => {

    function listDevices() {
        props.history.push(`/devices`);
    }

    function watchDevices() {
        props.history.push(`/watch`);
    }

    return (
        <Container>
            
             <button onClick={listDevices}>Devices</button>
             <button onClick={watchDevices}>Watch</button>

        </Container>
       
    );
};

export default CreateRoom;
