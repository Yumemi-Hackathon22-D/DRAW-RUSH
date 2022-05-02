import React, {useState} from 'react';
import {firestore, db} from '../firebase/index';
import {ref, push, set, serverTimestamp, onValue} from 'firebase/database';
import {collection, doc, addDoc,} from 'firebase/firestore';
import {TextField} from '@mui/material';


export const Room = () => {
    const allRoomRef = collection(firestore, 'rooms');
    let roomRef;
    const [isJoined, setIsJoined] = useState(false);
    const [roomName, setroomName] = useState('');
    const [roomId, setroomId] = useState('');
    const [messages, setMessages] = useState('');
    const [sendMessage, setSendMessage] = useState('');
    const [userName, setUserName] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        const messageRef = push(ref(db, 'rooms/' + roomId + '/messages/'), {
            userName: userName,
            msg: sendMessage,
            timeStamp: serverTimestamp()
        });
        setSendMessage('');
    };
    const ShowChat = () => {
        let result = [];
        for (let [key, i] of Object.entries(messages)) {
            result.push(
                <tr key={key}>
                    <th>{i.userName}</th>
                    <td>{i.msg}</td>
                </tr>
            )
        }
        return (<table>
            <tbody>{result}</tbody>
        </table>);

    }
    const Join = () => {
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

        if (!roomId && roomId === "") {
            const Room = async () => {
                let id = await AddRoomPromise();
                await SetRoom(id);
                return id;
            }
            Room().then((id) => {
                JoinChat(id)
                setIsJoined(true)
            })


        }

        const JoinChat = (id) => {
            const chatRef = ref(db, 'rooms/' + id + '/messages');
            onValue(chatRef, (snapshot) => {
                console.log(snapshot.val());
                let selfmessages = snapshot.val();
                setMessages(selfmessages);
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
                    <button onClick={handleSubmit}>Submit</button>
                </div>
                <ShowChat></ShowChat></> : <></>}

        </div>
    );
};

export default Room;
