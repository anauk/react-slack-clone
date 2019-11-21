import React from 'react'
import {Header, Segment, Input, Icon} from 'semantic-ui-react'

class MessagesHeader extends React.Component {
  render() {
    const {channelName, numUniqueUsers, handleSearchChange, searchLoading,
      isPrivateChannel} = this.props
    return (
      <Segment clearing>
        {/*Chanel Title*/}
        <Header
          fluid='true'
          as='h2'
          floated='left'
          style={{marginButton: 0}}
        >
    <span>
    {channelName}
      {!isPrivateChannel && <Icon name={'star outline'} color='black'/>}
    </span>
          <Header.Subheader>{numUniqueUsers}</Header.Subheader>
        </Header>
        {/*Channel Search*/}
        <Header floated='right'>
          <Input
            loading={searchLoading}
            onChange={handleSearchChange}
            size='mini'
            icon='search'
            name='searchTerm'
            placholder='search Messages'
          />
        </Header>
      </Segment>
    )
  }
}

export default MessagesHeader
