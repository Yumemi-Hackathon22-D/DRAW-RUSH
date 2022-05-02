import React, { useEffect, useState } from 'react';
import db from '../firebase/index';
import { collection, doc, setDoc, addDoc } from 'firebase/firestore';
import { TextField } from '@mui/material';

export const Room = () => {
  const allRoomRef = collection(db, 'rooms');
  let roomRef;
  const [roomName, setroomName] = useState('');
  const [roomId, setroomId] = useState('');
  const [messages, setMessages] = useState('');
  const [sendMessage, setSetMessage] = useState('');
  const [userName, setUserName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    collection(roomRef, 'messages').add({
      content: sendMessage,
      user: userName,
      time: db.Timestamp(),
    });
    setSetMessage('');
  };

  const Join = () => {
    // const AddRoom = async () => {
    //   let res = await addDoc(allRoomRef, { Name: roomName });
    //   setroomId(res.id);
    // };

    
    

    const AddRoomPromise = async () => {
      await new Promise((resolve) => {
        let res = addDoc(allRoomRef, { Name: roomName });
        resolve(res);
      }).then((val) => {
        console.log("val is " + val.id);
        setroomId(val.id)
      }).then(() => {
        SetRoom();
        console.log(roomRef)
      })
    }
    const SetRoom = async () => {
      await new Promise((resolve) => {
        roomRef = doc(allRoomRef, roomId);
      })
    }

    console.log(!roomId && roomId === "")

    if (!roomId && roomId === "") {
      AddRoomPromise();
    }

    // SetRoom();

    const JoinRoom = () => {
      useEffect(() => {
        roomRef
          .collection("messages")
          .orderBy("time")
          .onSnapshot((snapshot) => {
            const getMessages = snapshot.docs.map((doc) => {
              return doc.data()
            });
            setMessages(getMessages);
          });
      })
    };
  };

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

export default Room;

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
