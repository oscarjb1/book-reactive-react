import React from 'react'
import Tweet from './Tweet'
import Reply  from './Reply'
import update from 'react-addons-update'
import APIInvoker from "./utils/APIInvoker"
import PropTypes from 'prop-types'

class TweetsContainer extends React.Component{
  constructor(){
    super(...arguments)
    this.state = {
      tweets: []
    }
  }

  componentWillReceiveProps(props){
    let username = props.profile.userName
    let onlyUserTweet = props.onlyUserTweet
    this.loadTweets(username, onlyUserTweet)
  }

  // componentWillReceiveProps(props){
  componentWillMount(){
    let username = this.props.profile.userName
    let onlyUserTweet = this.props.onlyUserTweet
    this.loadTweets(username, onlyUserTweet)
  }

  loadTweets(username, onlyUserTweet){
    APIInvoker.invokeGET('/tweets' + (onlyUserTweet  ? "/" + username : ""), response => {
      if(response.ok){
        this.setState({
          tweets: response.body
        })
      }else{
        console.log(response)
      }

    },error => {
      console.log("Error al cargar los Tweets");
    })
  }



  addNewTweet(newTweet){
    let oldState = this.state;

    let newState = update(this.state, {
      tweets: {$splice: [[0, 0, newTweet]]}
    })

    this.setState(newState)

    //Optimistic Update
    APIInvoker.invokePOST('/secure/tweet',newTweet,  response => {
      if(!response.ok){
        this.setState(oldState)
      }else{
        this.setState(update(this.state,{
          tweets:{
            0 : {
              _id: {$set: response.tweet._id}
            }
          }
        }))
      }
    },error => {
      console.log("Error al cargar los Tweets");
    })
  }

  render(){
    let tweets= ''
    if(this.state.tweets != null){
      tweets = this.state.tweets.map(x => {
        return <Tweet key={x._id} tweet={x}/>
      })
    }

    let operations = {
      addNewTweet: this.addNewTweet.bind(this)
    }

    let header = null
    if(this.props.onlyUserTweet){
      header = (
        <div className="tweet-container-header">
          Tweets
        </div>)
    }else{
      header = (<Reply profile={this.props.profile} operations={operations}/>)
    }

    return (
      <main className="twitter-panel">
        {header}
        {tweets}
      </main>
    )
  }
}

TweetsContainer.propTypes = {
  onlyUserTweet: PropTypes.bool,
  profile: PropTypes.object.isRequired
}

TweetsContainer.defaultProps = {
  onlyUserTweet: false
}


export default TweetsContainer;
