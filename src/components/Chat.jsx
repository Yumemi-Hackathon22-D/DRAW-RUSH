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
const [sendMessage, setSendMessage] = useState('');
const [userName, setUserName] = useState('');


  const handleSubmit = (e) => {
    e.preventDefault();
    addDoc(collection(roomRef), { userName: userName, msg: sendMessage });
    setSendMessage('');
  };

  
  const Join = () => {
    const AddRoomPromise = async () => {
      await new Promise((resolve) => {
        let res = addDoc(allRoomRef, { Name: roomName });
        resolve(res);
      }).then((val) => {
        setroomId(val.id)
      })
      //   .then(() => {
      //   // SetRoom();
      //   roomRef = doc(allRoomRef, roomId);
      // }).then(() => {
      //   console.log(roomId);
      // })
    }
    const SetRoom = async () => {
      await new Promise((resolve) => {
        roomRef = doc(allRoomRef, roomId);
      })
    }

    console.log(!roomId && roomId === "")

    if (!roomId && roomId === "") {
      new Promise((resolve) => {
        AddRoomPromise(); // Firestoreのroomsに追加する
      }).then(() => {
        SetRoom(); // 部屋設定を変更する
      })
    }

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
      <div>
        <TextField value={sendMessage}
          onChange={(e) => { setSendMessage(e.target.value); }}
          variant='filled'></TextField>
        <button onClick={handleSubmit}>Submit</button>
        </div>
    </div>
  );
};

export default Room;
