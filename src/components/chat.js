import React from 'react';
import db from './../firebase/index';

function Chat() {
  const addChat = () => {
    const chatName = prompt('チャットルーム名を入力してくだせえ');

    if (chatName) {
      db.collection('rooms').add({
        name: chatName,
      });
    }
  };

  return;
}

export default Chat;
