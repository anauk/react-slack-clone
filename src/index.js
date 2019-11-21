import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import 'semantic-ui-css/semantic.min.css'
import registerServiceWorker from './registerServiceWorker';
import {BrowserRouter as Router, Switch, Route, withRouter} from "react-router-dom";
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import firebase from './firebase';
import {createStore} from "redux";
import {Provider, connect} from 'react-redux'
import { composeWithDevTools} from "redux-devtools-extension";
import rootReducer from "./reducers";
import {setUser, clearUser} from "./actions";
import Spinner from "./components/Spinner";

const store = createStore(rootReducer, composeWithDevTools())

class Root extends React.Component {
  componentDidMount() {
    console.log(this.props.loading)
    firebase.auth().onAuthStateChanged((user) => {
        if(user) {
          console.log(user, 'user')
          this.props.setUser(user)
          this.props.history.push('/')
        } else {
          this.props.history.push('/login')
          this.props.clearUser()
        }
    })
  }

  render() {
    console.log(this.props, 'props')
    return this.props.loading ? <Spinner /> : (
        <Switch>
          <Route path="/" exact component={App}/>
          <Route path="/login" component={Login}/>
          <Route path="/register" component={Register}/>
        </Switch>
    )
  }
}
const mapStateToProps = (state) => {
  return {
    loading: state.user.loading
  }
}
const RootWithAuth  = withRouter(connect(mapStateToProps, {setUser, clearUser})(Root))
ReactDOM.render(
  <Provider store={store}>
    <Router>
      <RootWithAuth />
    </Router>
  </Provider>, document.getElementById('root'));
registerServiceWorker();
