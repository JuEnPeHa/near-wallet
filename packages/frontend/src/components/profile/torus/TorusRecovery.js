import React from 'react';
import styled from 'styled-components';

const StyledContainer = styled.div`
    border: 2px solid #e6e6e6;
    border-radius: 8px;
    padding: 15px 20px;
`;

export default ({ onClick, userInfo }) => {
    return (
        <StyledContainer>
            <h4>Torus Recovery</h4>
            <div>{userInfo?.name}</div>
            <div>{userInfo?.email}</div>
            <div>{userInfo?.typeOfLogin}</div>
            <div><img src={userInfo?.profileImage} alt='profile'/></div>
            <button onClick={onClick}>
                {userInfo ? <>Deauthorize</> : <>Reauthorize</>}
            </button>
            <div>Note: Deauthorizing only removed TORUS from browser session storage.</div>
        </StyledContainer>
    );
};