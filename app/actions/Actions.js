import {
  LOAD_TWEETS,
  ADD_NEW_TWEET_SUCCESS,
  LOAD_SUGESTED_USERS,
  LOGIN_SUCCESS,
  UPDATE_LOGIN_FORM_REQUEST,
  LOGIN_ERROR,
  UPDATE_SIGNUP_FORM_REQUEST,
  VALIDATE_USER_RESPONSE,
  SIGNUP_RESULT_FAIL,
  FIND_FOLLOWERS_FOLLOWINGS_REQUEST,
  USER_PROFILE_REQUEST,
  CHANGE_TO_EDIT_MODE_REQUEST,
  CANCEL_EDIT_MODEL_REQUEST,
  UPDATE_USER_PAGE_FORM_REQUEST,
  USER_PAGE_AVATAR_UPDATE,
  USER_PAGE_BANNER_UPDATE,
  USER_PAGE_SAVE_CHANGES,
  USER_PAGE_FOLLOW_USER,
  UPDATE_REPLY_FORM,
  RESET_REPLY_FORM,
  LOAD_TWEET_DETAIL,
  ADD_NEW_TWEET_REPLY,
  RESET_FOLLOWERS_FOLLOWINGS_REQUEST,
  LOGOUT_REQUEST,
  LIKE_TWEET_REQUEST,
  LIKE_TWEET_DETAIL_REQUEST
} from './const'

import APIInvoker from '../utils/APIInvoker'
import { browserHistory } from 'react-router'
import update from 'react-addons-update'


//Services
export const relogin = () => (dispatch,getState) => {

  let token = window.localStorage.getItem("token")
  if(token == null){
    dispatch(loginFail())
    browserHistory.push('/login');
  }else{
    APIInvoker.invokeGET('/secure/relogin', response => {
      window.localStorage.setItem("token", response.token)
      window.localStorage.setItem("username", response.profile.userName)
      dispatch(loginSuccess( response.profile ))
    },error => {
      console.log("Error al autenticar al autenticar al usuario " );
      window.localStorage.removeItem("token")
      window.localStorage.removeItem("username")
      browserHistory.push('/login');
    })
  }
}

export const getTweet = (username, onlyUserTweet) => (dispatch, getState) => {
  APIInvoker.invokeGET('/tweets' + (onlyUserTweet  ? "/" + username : ""), response => {
    dispatch(loadTweetsSuccess(response.body))
  },error => {
    console.log("Error al cargar los Tweets");
  })
}

export const addNewTweet = (newTweet) => (dispatch, getState) => {
  APIInvoker.invokePOST('/secure/tweet',newTweet,  response => {
    newTweet._id = response.tweet._id
    let newState = update(getState().tweetsReducer, {
      tweets: {$splice: [[0, 0, newTweet]]}
    })

    dispatch(addNewTweetSuccess(newState.tweets))
  },error => {
    console.log("Error al cargar los Tweets");
  })
}

export const getSugestedUsers = ()  => (dispatch, getState) => {
  APIInvoker.invokeGET('/secure/suggestedUsers', response => {
    dispatch(loadSugestedUserSucess(response.body))
  },error => {
    console.log("Error al actualizar el perfil");
  })
}

export const loginRequest = ()  => (dispatch, getState) => {

  let credential = {
    username: getState().loginFormReducer.username,
    password: getState().loginFormReducer.password
  }

  APIInvoker.invokePOST('/login',credential, response => {
    window.localStorage.setItem("token", response.token)
    window.localStorage.setItem("username", response.profile.userName)
    window.location = '/';
  },error => {
    dispatch(loginFailForm(error.message))
  })
}

export const updateLoginForm = (field, value) => (dispatch, getState) => {
  dispatch(updateLoginFormRequest(field,value))
}

export const validateUser = (username) => (dispatch, getState) => {
  if(username.trim() === ''){
    return
  }
  APIInvoker.invokeGET('/usernameValidate/' + username, response => {
    dispatch(validateUserRequest(response.ok, response.message))
  },error => {
    dispatch(validateUserRequest(error.ok, error.message))
  })
}

export const signup = () => (dispatch, getState) => {
  let currentState = getState().signupFormReducer
  if(!currentState.license){
    dispatch(signupResultFail('Acepte los términos de licencia'))
  }else if(!currentState.userOk){
    dispatch(signupResultFail('Favor de revisar su nombre de usuario'))
  }else{
    let request = {
      "name": currentState.name,
      "username": currentState.username,
      "password": currentState.password
    }

    APIInvoker.invokePOST('/signup',request, response => {
      browserHistory.push('/login');
    },error => {
      dispatch(signupResultFail(error.error))
    })
  }
}

export const  updateSignupForm = (field,value) => (dispatch, getState) => {
  dispatch(updateSignupFormRequest(field,value))
}

export const findFollowersFollowings = (username, type) => (dispatch, getState) => {
  APIInvoker.invokeGET('/' + type + "/" + username, response => {
    dispatch(findFollowersFollowingsRequest(response.body))
  },error => {
    console.log("Error al obtener los seguidores");
  })
}

export const resetFollowersFollowings = () => (dispatch, getState) => {
  dispatch(resetFollowersFollowingsRequest())
}

export const getUserProfile = (username)  => (dispatch, getState) => {
  APIInvoker.invokeGET('/profile/' + username, response => {
    dispatch(getUserProfileResponse(response.body))
  },error => {
    console.log("Error al cargar los Tweets", error);
  })
}

export const chageToEditMode = () => (dispatch, getState) => {
  let currentProfile = getState().userPageReducer.profile
  dispatch(changeToEditModeRequest(currentProfile))
}

export const cancelEditMode = () => (dispatch, getState) => {
  dispatch(cancelEditModeRequest())
}

export const updateUserPageForm = (event) => (dispatch, getState) => {
  dispatch(updateUserPageFormRequest(event.target.id, event.target.value))
}

export const userPageImageUpload = (event) => (dispatch, getState) => {
  let id = event.target.id
  let reader = new FileReader();
  let file = event.target.files[0];

  if(file.size > 1240000){
    alert('La imagen supera el máximo de 1MB')
    return
  }

  reader.onloadend = () => {
    if(id == 'bannerInput'){
      dispatch(userPageBannerUpdateRequest(reader.result))
    }else{
      dispatch(userPageAvatarUpdateRequest(reader.result))
    }
  }
  reader.readAsDataURL(file)
}

export const userPageSaveChanges = () => (dispatch, getState) => {
  let state = getState().userPageReducer
  let request = {
    username: state.profile.userName,
    name: state.profile.name,
    description: state.profile.description,
    avatar: state.profile.avatar,
    banner: state.profile.banner
  }

  APIInvoker.invokePUT('/secure/profile', request, response => {
    dispatch(userPageSaveChangesRequest())
  },error => {
    console.log("Error al actualizar el perfil");
  })
}

export const followUser = (username) => (dispatch,getState) => {
  let request = {
    followingUser: username
  }

  APIInvoker.invokePOST('/secure/follow', request, response => {
    dispatch(followUserRequest(!response.unfollow))
  },error => {
    console.log("Error al actualizar el perfil");
  })
}

export const updateReplyForm = (field,value) => (dispatch, getState) => {
  dispatch(updateReplyFormRequest(field,value))
}

export const resetReplyForm = () => (dispatch, getState) => {
  dispatch(resetReplyFormRequest())
}

export const loadTweetDetail= (tweet) => (dispatch, getState) => {
  APIInvoker.invokeGET('/tweetDetails/'+tweet, response => {
    dispatch(loadTweetDetailRequest(response.body))
  },error => {
    console.log("Error al cargar los Tweets");
  })
}

export const addNewTweetReply = (newTweetReply, tweetParentID) => (dispatch, getState) => {
  let request = {
    tweetParent: tweetParentID,
    message: newTweetReply.message,
    image: newTweetReply.image
  }

  APIInvoker.invokePOST('/secure/tweet', request, response => {
    newTweetReply._id = response.tweet._id
    dispatch(addNewTweetReplyRequest(newTweetReply))
  },error => {
    console.log("Error al cargar los Tweets");
  })
}

export const logout = () => (dispatch, getState) => {
  dispatch(logoutRequest())
}

export const likeTweet = (tweetId, like) => (dispatch, getState) => {

  let request = {
    tweetID: tweetId,
    like: like
  }

  APIInvoker.invokePOST('/secure/like', request, response => {
    dispatch(likeTweetRequest(tweetId, response.body.likeCounter))
  },error => {
    console.log("Error al cargar los Tweets");
  })
}

export const likeTweetDetail = (tweetId, like) => (dispatch, getState) => {
  let request = {
    tweetID: tweetId,
    like: like
  }

  APIInvoker.invokePOST('/secure/like', request, response => {
    dispatch(likeTweetDetailRequest(tweetId, response.body.likeCounter))
  },error => {
    console.log("Error al cargar los Tweets");
  })
}

//

//Actions
const  likeTweetDetailRequest = (tweetId, likeCounter) => ({
  type: LIKE_TWEET_DETAIL_REQUEST,
  tweetId: tweetId,
  likeCounter: likeCounter
})

const  likeTweetRequest = (tweetId, likeCounter) => ({
  type: LIKE_TWEET_REQUEST,
  tweetId: tweetId,
  likeCounter: likeCounter
})

const logoutRequest = () => ({
  type: LOGOUT_REQUEST
})

const addNewTweetReplyRequest = (newTweetReply) => ({
  type: ADD_NEW_TWEET_REPLY,
  newTweetReply: newTweetReply
})

const loadTweetDetailRequest = (tweetDetails) => ({
  type: LOAD_TWEET_DETAIL,
  tweetDetails: tweetDetails
})

const resetReplyFormRequest = () => ({
  type: RESET_REPLY_FORM
})

const updateReplyFormRequest = (field,value) => ({
  type: UPDATE_REPLY_FORM,
  field: field,
  value: value
})

const followUserRequest = (follow) => ({
  type: USER_PAGE_FOLLOW_USER,
  follow: follow
})

const userPageSaveChangesRequest  = () => ({
  type: USER_PAGE_SAVE_CHANGES
})

const userPageBannerUpdateRequest = (img) => ({
  type: USER_PAGE_BANNER_UPDATE,
  img: img
})

const userPageAvatarUpdateRequest = (img) => ({
  type: USER_PAGE_AVATAR_UPDATE,
  img: img
})

const updateUserPageFormRequest = (field, value) => ({
  type: UPDATE_USER_PAGE_FORM_REQUEST,
  field: field,
  value: value
})

const cancelEditModeRequest = () => ({
  type: CANCEL_EDIT_MODEL_REQUEST
})

const changeToEditModeRequest = (currentState) => ({
  type: CHANGE_TO_EDIT_MODE_REQUEST,
  edit: true,
  profile: currentState,
  currentState: currentState
})

const getUserProfileResponse = (profile) => ({
  type: USER_PROFILE_REQUEST,
  edit: false,
  profile: profile
})

const findFollowersFollowingsRequest = (users) => ({
  type: FIND_FOLLOWERS_FOLLOWINGS_REQUEST,
  users: users
})

const resetFollowersFollowingsRequest = () => ({
  type: RESET_FOLLOWERS_FOLLOWINGS_REQUEST
})

const signupResultFail = (signupFailMessage) => ({
  type: SIGNUP_RESULT_FAIL,
  signupFail: true,
  signupFailMessage: signupFailMessage
})

const validateUserRequest = (userOk, userOkMessage) => ({
  type: VALIDATE_USER_RESPONSE,
  userOk: userOk,
  userOkMessage: userOkMessage
})

const updateSignupFormRequest = (field,value,fieldType) => ({
  type: UPDATE_SIGNUP_FORM_REQUEST,
  field: field,
  value: value,
  fieldType: fieldType
})

const loginFailForm = (loginMessage) => ({
  type: LOGIN_ERROR,
  loginMessage: loginMessage
})

const updateLoginFormRequest = (field, value) => ({
  type: UPDATE_LOGIN_FORM_REQUEST,
  field: field,
  value: value
})

const loginSuccess = profile => ({
  type: LOGIN_SUCCESS,
  profile: profile
})

const loginFail = () => ({
  type: LOGIN_SUCCESS,
  profile: null
})

const loadTweetsSuccess = tweets => ({
  type: LOAD_TWEETS,
  tweets: tweets
})

const addNewTweetSuccess = tweets => ({
  type: ADD_NEW_TWEET_SUCCESS,
  tweets: tweets
})

const loadSugestedUserSucess = users => ({
  type: LOAD_SUGESTED_USERS,
  users: users
})
