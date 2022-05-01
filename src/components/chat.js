import React, { useEffect, useState } from 'react';
import db from './../firebase/index';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { TextField } from '@mui/material';

const JoinChat = (props) => {
  var rooms = collection(db, 'rooms');
  let roomRef;
  const [roomName, setroomName] = useState('');

  let joinRoom = {
    Name: roomName,
  };

  roomRef = setDoc(rooms, joinRoom);

  return (
    <div>
      <TextField
        value={roomName}
        onChange={(e) => {
          setroomName(e.target.value);
        }}
        label='ルーム名'
        variant='filled'
      ></TextField>
      <button onClick={JoinChat()}>Join</button>
    </div>
  );
};

export default JoinChat;

// export default class joinRoom extends React.Component {
//   constructor(props) {
//     super(props);
//     var rooms = collection(db, 'rooms');
//     this.state = {
//       roomName: '',
//     };
//   }

//   joinRoom = (props) => {
//     let roomRef;

//     if (!!props.roomName) {
//     } else {
//       let newRoom = {
//         Name: props.roomName,
//       };

//       setDoc(roomRef, newRoom);
//     }
//   };

//   roomNameChange = (event) => {
//     this.setState({
//       [event.target.name]: event.target.value,
//     });
//   };

//   render() {
//     return (
//       <div>
//         <TextField
//           name='roomName'
//           value={this.state.roomName}
//           onChange={this.roomNameChange}
//         />
//         <button onClick={this.joinRoom(this.state.roomName)}>
//           Join or Create
//         </button>
//       </div>
//     );
//   }
// }
