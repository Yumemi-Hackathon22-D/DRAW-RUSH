import React from 'react';
import { Button, TextField } from '@mui/material';

export default class ChatBox extends React.Component {
  render() {
    return (
      <div className='ChatBox'>
        <div className=''>
          <TextField
            name='user_name'
            onChange={this.props.onTextChange}
            className=''
            placeholder='Name'
          />
          <br />
        </div>
        <TextField
          rows='4'
          multiLine='true'
          name='text'
          className=''
          onChange={this.props.onTextChange}
        />
        <Button
          primary='true'
          label='Send'
          className=''
          onClick={this.props.onButtonClick}
        />
      </div>
    );
  }
}
