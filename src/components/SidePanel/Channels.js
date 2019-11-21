import React from 'react'
import {Menu, Icon, Modal, Form, Input, Button, Label} from "semantic-ui-react";
import firebase from "../../firebase";
import {setCurrentChannel, setPrivateChannel} from "../../actions";
import {connect} from "react-redux";

class Channels extends React.Component {
  state = {
    activeChannel: '',
    user: this.props.currentUser,
    channel: null,
    channels: [],
    chanelName: '',
    chanelDetails: '',
    modal: false,
    channelsRef: firebase.database().ref('channels'),
    messagesRef: firebase.database().ref('messages'),
    notifications: [],
    firstLoad: true
  }

  componentDidMount() {
    this.addListeners()
  }

  componentWillUnmount() {
    this.removeListeners()
  }

  removeListeners = () => {
    this.state.channelsRef.off()
  }
  addListeners = () => {
    let loadedChannels = []
    this.state.channelsRef.on('child_added', snap => {
      loadedChannels.push(snap.val())
      this.setState({channels: loadedChannels}, () => this.setFirstChannel())
      this.addNotificationListener(snap.key)
    })
  }
  addNotificationListener = channelId => {
    this.state.messagesRef.child(channelId).on('value', snap => {
      if (this.state.channel) {
        this.handleNotifications(channelId, this.state.channel.id, this.state.notifications, snap)
      }
    })
  }
  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0
    let index = notifications.findIndex(notifications => notifications.id === channelId)
    if (index !== -1) {
      if (channelId !== currentChannelId) {
        lastTotal = notifications[index].total
        if (snap.numChildren() - lastTotal > 0) {
          notifications[index].count = snap.numChildren() - lastTotal
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren()
    } else {
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0
      })
    }
    this.setState({notifications})
  }
  setFirstChannel = () => {
    const firstChannel = this.state.channels[0]
    if (this.state.firstLoad && this.state.channels.length > 0) {
      this.props.setCurrentChannel(firstChannel)
      this.setActiveChannel(firstChannel)
      this.setState({ channel: firstChannel })
    }
    this.setState({firstLoad: false})
  }

  closeModal = () => {
    this.setState({modal: false})
  }
  openModal = () => {
    this.setState({modal: true})
  }
  handleChange = (event) => {
    this.setState({[event.target.name]: event.target.value})
  }
  handleSubmit = event => {
    event.preventDefault()
    if (this.isFormValid(this.state)) {
      this.addChanel()
    }
  }
  isFormValid = ({chanelName, chanelDetails}) => chanelName && chanelDetails
  addChanel = () => {
    const {channelsRef, chanelName, chanelDetails, user} = this.state
    const key = channelsRef.push().key
    const newChannel = {
      id: key,
      name: chanelName,
      detail: chanelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL
      }
    }
    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({chanelName: '', chanelDetails: ''})
        this.closeModal()
      })
      .catch((err) => {
        console.error(err)
      })

  }
  changeChannel = channel => {
    this.setActiveChannel(channel)
    this.clearNotifications()
    this.props.setCurrentChannel(channel)
    this.props.setPrivateChannel(false)
    this.setState({channel})
  }
  clearNotifications = () => {
    let index = this.state.notifications.findIndex(notification => notification.id === this.state.channel.id )
    if(index !== -1) {
      let updateNotifications = [...this.state.notifications]
      updateNotifications[index].total = this.state.notifications[index].lastKnownTotal
      updateNotifications[index].count = 0
      this.setState({ notifications: updateNotifications })
    }
  }
  setActiveChannel = (channel) => {
    this.setState({activeChannel: channel.id})
  }
  displayChannels = (channels) => (
    channels.length > 0 && channels.map(channel => (
      <Menu.Item
        key={channel.id}
        mane={channel.name}
        onClick={() => this.changeChannel(channel)}
        style={{opacity: 0.7}}
        active={channel.id === this.state.activeChannel}
      >
        {this.getNotificationCount(channel) && (
          <Label color='red'>{this.getNotificationCount(channel)}</Label>
        )}
        #{channel.name}
      </Menu.Item>
    ))
  )
  getNotificationCount = channel => {
    let count = 0
    this.state.notifications.forEach(notification => {
      if (notification.id === channel.id) {
        count = notification.count
      }
    })
    if (count > 0) return count
  }

  render() {
    const {channels, modal} = this.state

    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
    <span>
      <Icon name='exchange '/> CHANELS
    </span>{" "}
            ({channels.length}) <Icon name='add' onClick={this.openModal}/>
          </Menu.Item>

          {this.displayChannels(channels)}

        </Menu.Menu>

        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a chanel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>

              <Form.Field>
                <Input
                  fluid
                  label='Name of chanel'
                  name='chanelName'
                  onChange={this.handleChange}
                />
              </Form.Field>

              <Form.Field>
                <Input
                  fluid
                  label='Chanel Details'
                  name='chanelDetails'
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color='green' inverted={true} onClick={this.handleSubmit}>
              <Icon name='checkmark'/> Add
            </Button>
            <Button color='red' inverted={true} onClick={this.closeModal}>
              <Icon name='remove'/> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => {
  return {
    channel: state.channel.currentChannel
  }
}
export default connect(mapStateToProps, {setCurrentChannel, setPrivateChannel})(Channels)
