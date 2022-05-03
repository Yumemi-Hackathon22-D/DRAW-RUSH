import React, {useState, useEffect} from 'react';
import {firestore, db} from '../firebase/index';
import {ref, push, set, serverTimestamp, onValue, off} from 'firebase/database';
import {collection, doc, addDoc, getDoc} from 'firebase/firestore';
import {TextField, Button, IconButton} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';


export const Room = () => {
    const allRoomRef = collection(firestore, 'rooms');
  let roomRef;
  let tmproomName;
    const [isJoined, setIsJoined] = useState(false);
    const [roomName, setroomName] = useState('');
    const [roomId, setroomId] = useState('');
    const [messages, setMessages] = useState('');
    const [sendMessage, setSendMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        const messageRef = push(ref(db, 'rooms/' + roomId + '/messages/'), {
            userName: userName,
            msg: sendMessage,
            timeStamp: serverTimestamp()
        });
        setSendMessage('');
    };

    const Checked= async() => {
        setIsCopied(true);
        setTimeout(() => {setIsCopied(false)},1000)
    }
    const ShowChat = () => {
      let result = [];
      if (messages === null) return;
        for (let [key, i] of Object.entries(messages)) {
            result.push(
                <tr key={key}>
                    <th>{i.userName}</th>
                    <td>{i.msg}</td>
                    <td>{new Date(i.timeStamp).toLocaleTimeString('ja-JP')}</td>
                </tr>
            )
        }
        return (<table>
            <tbody>{result}</tbody>
        </table>);

  }
  
  const Join = () => {
    const CheckRoom = async () => {
      let Ref = await doc(allRoomRef, roomName);
      let docSnap = await getDoc(Ref);
      if (!docSnap.exists()) {
        let Id = await AddRoomPromise();
        setroomId(Id)
          return Id
      }
      else {
          setroomId(roomName)
          return roomName
      }
    }

    
    
        const AddRoomPromise = async () => {
            let res = await addDoc(allRoomRef, {Name: roomName});
            setroomId(res.id);
            await set(ref(db, 'rooms/' + res.id), {messages: ""});
            console.log(res.id);
            return res.id
        }
        const SetRoom = async (roomId) => {
            roomRef = await doc(allRoomRef, roomId);
        }
    
    const Room = async () => {
                let id = await CheckRoom();
                await SetRoom(id);
                return id;
    }

            Room().then((id) => {
                JoinChat(id)
                setIsJoined(true)
            })

        const JoinChat = (id) => {
            const chatRef = ref(db, 'rooms/' + id + '/messages');
            onValue(chatRef, (snapshot) => {
                console.log(snapshot.val());
                let selfmessages = snapshot.val();
                setMessages(selfmessages);
            })
    }

    
    };
    const Left = () => {
        const Ref = ref(db, 'rooms/'+ roomId + '/messages');
        off(Ref);
        setIsJoined(false);
    }

    return (
        <div>
            <div>
                <TextField
                    disabled = {isJoined}
                    value={roomName}
            onChange={(e) => {
              tmproomName = e.target.value;
              setroomName(e.target.value);
                    }}
                    label='ルーム名/ID'
                    variant='filled'
                ></TextField>
                {isJoined ? <Button variant="contained" color="error" onClick={Left}>Left</Button>:
                <Button variant="contained" onClick={Join}>Join</Button>}
            </div>
            {isJoined ? <>
                <div>
                    <TextField value={userName}
                               label='ユーザー名'
                               onChange={(e) => setUserName(e.target.value)}
                               variant='filled'></TextField>
                    <TextField value={sendMessage}
                               onChange={(e) => {
                                 setSendMessage(e.target.value);
                               }}
                               variant='filled'></TextField>
                    <Button variant="contained" color="success" onClick={handleSubmit}>Submit</Button>
          </div>
          <div><p>この部屋のID: { roomId }</p>
          <IconButton aria-label="copy" onClick={() => {
              navigator.clipboard.writeText(roomId)
              Checked();
              }}> {!isCopied ? <ContentCopyIcon/>: <CheckIcon/>}</IconButton></div>
                <ShowChat></ShowChat></> : <></>}

        </div>
    );
};

export default Room;
