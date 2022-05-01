import React, { useEffect, useState } from 'react';
import db from './../firebase/index';
import { collection, doc, setDoc, addDoc } from 'firebase/firestore';
import { TextField } from '@mui/material';

const JoinChat = (props) => {
  var roomRef = collection(db, 'rooms');
  const [roomName, setroomName] = useState('');

  function Join() {
    console.log(roomRef);
    const AddRoom = async () => {
      let res = await addDoc(roomRef, { Name: roomName });
      console.log(res);
    };
    AddRoom();
  }

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
      <button onClick={Join}>Join</button>
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
