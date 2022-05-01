import React, { useMemo, useState, Component } from 'react';
import './../App.css';
import { database } from './../firebase/index.js';
import Message from './Message.js';
import ChatBox from './ChatBox.js';

const messagesRef = useMemo(
  () => database.collection('chatroom').doc('room1').collection('messages'),
  []
);

class AppChat extends Component {
  constructor(props) {
    super(props);
    this.onTextChange = this.onTextChange.bind(this);
    this.onButtonClick = this.onButtonClick.bind(this);
    this.state = {
      text: '',
      user_name: '',
      messages: [],
    };
  }

  render() {
    return (
      <div className='App'>
        <div className='App-header'>
          <h2>CHAT</h2>
        </div>
        <div className='MessageList'>
          {this.state.messages.map((m, i) => {
            return <Message key={i} message={m} />;
          })}
        </div>
        <ChatBox
          onTextChange={this.onTextChange}
          onButtonClick={this.onButtonClick}
        />
      </div>
    );
  }

  onTextChange(e) {
    if (e.target.name == 'user_name') {
      this.setState({
        user_name: e.target.value,
      });
    } else if (e.tartget.name == 'text') {
      this.setState({
        text: e.target.value,
      });
    }
  }

  onButtonClick() {
    if (this.state.user_name == '') {
      // Anonymous check
      this.state.user_name = '匿名さん';
    }
    if (this.state.text == '') {
      // null message check
      alert('メッセージを入力してください');
      return;
    }
    messagesRef.push({
      user_name: this.state.user_name,
      text: this.state.text,
    });
  }

  componentWillMount() {
    messagesRef.on('child_added', (snapshot) => {
      const m = snapshot.val();
      let msgs = this.state.messages;

      msgs.push({
        text: m.text,
        user_name: m.user_name,
      });

      this.setState({ messages: msgs });
    });
  }
}

export default AppChat;
