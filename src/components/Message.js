import React from 'react';
import { Chip, List, ListItem } from '@mui/material';

const styles = {
  chip: {
    margin: 4,
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
};

const style = { margintop: -5 };

export default class Message extends React.Component {
  render() {
    return (
      <div className='Message'>
        <List>
          <ListItem disabled='true'>
            <span style={{ marginBottom: -5 }}>
              @{this.props.message.user_name}
            </span>
            <div className=''>
              <Chip style={styles.chip}>{this.props.message.text}</Chip>
            </div>
          </ListItem>
        </List>
      </div>
    );
  }
}
