import React from "react";
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
            
             <button onClick={listDevices}>Choose Devices</button>
             <button onClick={watchDevices}>Watch</button>

        </Container>
       
    );
};

export default CreateRoom;
