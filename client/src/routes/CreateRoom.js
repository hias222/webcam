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

    function create() {
        const id = uuid();
        props.history.push(`/room/${id}`);
    }

    function listDevices() {
        props.history.push(`/devices`);
    }

    return (
        <Container>
             <button onClick={create}>Create room</button>
             <button onClick={listDevices}>Devices</button>

        </Container>
       
    );
};

export default CreateRoom;
