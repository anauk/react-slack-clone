import React from 'react'
import {Segment, Comment} from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import firebase from "../../firebase";
import Message from "./Message";

class Messages extends React.Component {
  state = {
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database().ref('privateMessages'),
    messagesRef: firebase.database().ref('messages'),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messagesLoading: true,
    messages: [],
    progressBar: false,
    numUniqueUsers: '',
    searchTerm: '',
    searchLoading: false,
    searchResults: []
  }

  componentDidMount() {
    console.log('componentDidMount')
    const {channel, user} = this.state
    if (channel && user) {
      this.addListeners(channel.id)
    }
  }

  addListeners = channelId => {
    this.addMessageListener(channelId)
  }
  addMessageListener = channelId => {
    let loadMessages = []
    const ref = this.getMessagesRef()
    ref.child(channelId).on("child_added", snap => {
      loadMessages.push(snap.val())
      console.log(loadMessages, 'loadMessages')
      this.setState({
        messages: loadMessages,
        messagesLoading: false
      })
      this.countUniqueUsers(loadMessages)
    })
  }
  getMessagesRef = () => {
    const { messagesRef, privateChannel, privateMessagesRef }  = this.state
    return privateChannel ? privateMessagesRef : messagesRef
  }
  countUniqueUsers = messages => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name)
      }
      return acc
    }, [])
    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0
    const numUniqueUsers = `${uniqueUsers.length} user${plural ? 's' : ''}`
    this.setState({numUniqueUsers})
  }
  displayMessages = messages =>
    messages.length > 0 &&
    messages.map(message => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ))

  isProgressBarVisible = percent => {
    if (percent > 0) {
      this.setState({progressBar: true})
    }
  }
  displayChannelName = channel => {
    return channel ? `${this.state.privateChannel  ? '@' : '#'}${channel.name}` : ''
  }
  handleSearchChange = event => {
    this.setState({
      searchTerm: event.target.value,
      searchLoading: true
    }, () => this.handleSearchMessages())
  }
  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages]
    const regex = new RegExp(this.state.searchTerm, 'gi')
    const searchResults = channelMessages.reduce((acc, message) => {
      if(
        (message.content && message.content.match(regex)) ||
        (message.user.name && message.user.name.match(regex))
      ){
        acc.push(message)
      }
      return acc
    }, [])
    this.setState({searchResults})
    setTimeout(() => this.setState({searchLoading: false}), 1000)
  }

  render() {
    const {messagesRef, messages, channel, user, numUniqueUsers, searchResults, searchTerm, searchLoading, privateChannel} = this.state
    console.log(this.state, 'this.state')
    return (
      <React.Fragment>
        <MessagesHeader
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={privateChannel}
        />

        <Segment>
          <Comment.Group className="messages">
            {/*className={progressBar ? 'messages__progress' : messages}>*/}
            {/*Messages*/}
            {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isPrivateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
          isProgressBarVisible={this.isProgressBarVisible}
        />

      </React.Fragment>
    )
  }
}

export default Messages
