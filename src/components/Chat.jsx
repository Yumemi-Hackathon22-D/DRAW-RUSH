import React, { useEffect, useState } from 'react';
import { firestore, db } from '../firebase/index';
import { ref, push, set, serverTimestamp, onValue } from 'firebase/database';
import { collection, doc, setDoc, addDoc,  } from 'firebase/firestore';
import { TextField } from '@mui/material';





export const Room = () => {

  const allRoomRef = collection(firestore, 'rooms');
let roomRef;
const [roomName, setroomName] = useState('');
const [roomId, setroomId] = useState('');
const [messages, setMessages] = useState('');
const [sendMessage, setSendMessage] = useState('');
const [userName, setUserName] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    const messageRef = push(ref(db, 'rooms/'+roomId+'/messages/'), {
        userName: userName,
        msg: sendMessage,
        timeStamp: serverTimestamp()
      });
    setSendMessage('');
  };

  const ShowChat = () => {
    let result = [];
    console.log(messages);
     {
      for (let i in messages) {
        result.push(
          <tr key={i}>
            <th>{i.userName}</th>
            <td>{i.msg}</td>
          </tr>
        )
      }
      return result;
    }
  }
  
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
        resolve();
      })
    }

    if (!roomId && roomId === "") {
      new Promise((resolve) => {
        AddRoomPromise(); // Firestoreのroomsに追加する
      }).then(() => {
        SetRoom(); // 部屋設定を変更する
        JoinChat();
      }).then(() => {
        console.log("Setup fin")
      }).then(() => {
        JoinChat();
        console.log("Joined Chat")
      })
    }

    const JoinChat = () => {
      useEffect(() => {
        const chatRef = ref(db, 'rooms/' + roomId + '/messages/');
        console.log(chatRef);
        chatRef.orderByChild('timeStamp').limitToLast(100).on('value', (snapshot) => {
          console.log(snapshot.val());
          let selfmessages = snapshot.val();
          setMessages(selfmessages);
          // $('<li>').text(msg.userName + ' : ' + msg.msg).pretendTo('.messages')
        })
      })
    }
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
        <TextField value={userName} 
          label='ユーザー名'
          onChange={(e) => setUserName(e.target.value)}
        variant='filled'></TextField>
        <TextField value={sendMessage}
          onChange={(e) => { setSendMessage(e.target.value); }}
          variant='filled'></TextField>
        <button onClick={handleSubmit}>Submit</button>
      </div>
      <ShowChat></ShowChat>
    </div>
  );
};

export default Room;
